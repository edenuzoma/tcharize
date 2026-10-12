import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import nodemailer from "nodemailer";
import {
  passwordLoginSchema,
  passwordSignupSchema,
  requestOtpSchema,
  resetPasswordSchema,
  verifySignupSchema,
  type AuthResponse,
} from "@tcharize/contracts";
import { DatabaseService } from "../../infrastructure/database/database.service";
import { RedisService } from "../../infrastructure/redis/redis.service";

const scrypt = promisify(scryptCallback);
type OtpPurpose = "SIGNUP" | "PASSWORD_RESET";
interface TokenPayload { sub: string; email: string; exp: number }
interface PendingSignup { displayName: string; organizationName?: string; accountType: "individual" | "team" }

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  private get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET is required in production.");
    return "development-only-change-me-32-characters";
  }

  private async checkRateLimit(key: string, limit: number, seconds: number) {
    const count = await this.redis.connection.incr(key);
    if (count === 1) await this.redis.connection.expire(key, seconds);
    if (count > limit) throw new BadRequestException("Please wait a little, then try again.");
  }

  private hashOtp(code: string) {
    return createHmac("sha256", this.jwtSecret).update(code).digest("hex");
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derived.toString("hex")}`;
  }

  private async verifyPassword(password: string, stored: string) {
    if (!stored.startsWith("scrypt$")) {
      const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
      const expected = Buffer.from(stored);
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
    const [, salt, expectedHex] = stored.split("$");
    if (!salt || !expectedHex) return false;
    const actual = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private async issueOtp(userId: string, email: string, purpose: OtpPurpose) {
    await this.db.otpCode.updateMany({ where: { userId, purpose, usedAt: null }, data: { usedAt: new Date() } });
    const code = randomInt(100_000, 1_000_000).toString();
    await this.db.otpCode.create({
      data: { userId, purpose, codeHash: this.hashOtp(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    if (!(await this.sendBrevoEmail(email, code, purpose))) {
      throw new BadRequestException("We could not send your code. Please try again.");
    }
  }

  private async consumeOtp(userId: string, code: string, purpose: OtpPurpose) {
    const otp = await this.db.otpCode.findFirst({
      where: { userId, purpose, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) throw new BadRequestException("Your code has expired. Ask for a new code.");
    if (otp.attempts >= 5) throw new BadRequestException("Too many tries. Ask for a new code.");
    const actual = Buffer.from(this.hashOtp(code));
    const expected = Buffer.from(otp.codeHash);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      await this.db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new BadRequestException("That code is not right. Try again.");
    }
    await this.db.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  }

  async signupWithPassword(input: unknown): Promise<{ message: string; email: string }> {
    const parsed = passwordSignupSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((i) => i.message).join(" "));
    const { email, password, displayName, organizationName, accountType } = parsed.data;
    await this.checkRateLimit(`auth:signup:${email}`, 3, 15 * 60);
    const existing = await this.db.user.findUnique({ where: { email } });
    if (existing?.emailVerifiedAt) throw new BadRequestException("This email already has an account. Sign in instead.");
    const passwordHash = await this.hashPassword(password);
    const user = existing
      ? await this.db.user.update({ where: { id: existing.id }, data: { displayName, passwordHash } })
      : await this.db.user.create({ data: { email, displayName, passwordHash } });
    const pending: PendingSignup = { displayName, organizationName, accountType };
    await this.redis.connection.set(`auth:pending-signup:${email}`, JSON.stringify(pending), "EX", 15 * 60);
    await this.issueOtp(user.id, email, "SIGNUP");
    return { message: "We sent a 6-digit code to your email.", email };
  }

  async verifySignup(input: unknown): Promise<AuthResponse> {
    const parsed = verifySignupSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((i) => i.message).join(" "));
    const { email, code } = parsed.data;
    await this.checkRateLimit(`auth:verify:${email}`, 8, 15 * 60);
    const user = await this.db.user.findUnique({ where: { email }, include: { memberships: true } });
    if (!user) throw new BadRequestException("Start sign up again.");
    if (user.emailVerifiedAt) throw new BadRequestException("This account is already verified. Sign in instead.");
    const pendingRaw = await this.redis.connection.get(`auth:pending-signup:${email}`);
    if (!pendingRaw) throw new BadRequestException("Your sign-up session expired. Start again.");
    await this.consumeOtp(user.id, code, "SIGNUP");
    const pending = JSON.parse(pendingRaw) as PendingSignup;
    const baseName = pending.accountType === "team" && pending.organizationName
      ? pending.organizationName
      : `${pending.displayName}'s Workspace`;
    const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
    await this.db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
      if (user.memberships.length === 0) {
        await tx.organization.create({
          data: {
            name: baseName,
            slug: `${baseSlug}-${randomInt(1000, 10_000)}`,
            memberships: { create: { userId: user.id, role: "OWNER" } },
            projects: { create: { name: "Default Project", slug: "default-project", sourceLanguage: "en" } },
            subscription: { create: { plan: "FREE", status: "ACTIVE", wordLimit: 10_000, wordsUsed: 0, currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000) } },
          },
        });
      }
    });
    await this.redis.connection.del(`auth:pending-signup:${email}`);
    return this.authResponse(user.id, user.email, user.displayName);
  }

  async loginWithPassword(input: unknown): Promise<AuthResponse> {
    const parsed = passwordLoginSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((i) => i.message).join(" "));
    await this.checkRateLimit(`auth:login:${parsed.data.email}`, 10, 15 * 60);
    const user = await this.db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.passwordHash || !(await this.verifyPassword(parsed.data.password, user.passwordHash))) {
      throw new UnauthorizedException("Email or password is not right.");
    }
    if (!user.emailVerifiedAt) throw new UnauthorizedException("Verify your email before you sign in.");
    if (!user.passwordHash.startsWith("scrypt$")) {
      await this.db.user.update({ where: { id: user.id }, data: { passwordHash: await this.hashPassword(parsed.data.password) } });
    }
    return this.authResponse(user.id, user.email, user.displayName);
  }

  async requestOtp(input: unknown): Promise<{ message: string }> {
    const parsed = requestOtpSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((i) => i.message).join(" "));
    await this.checkRateLimit(`auth:reset:${parsed.data.email}`, 3, 15 * 60);
    const user = await this.db.user.findUnique({ where: { email: parsed.data.email } });
    if (user?.emailVerifiedAt) await this.issueOtp(user.id, user.email, "PASSWORD_RESET");
    return { message: "If that email has an account, we sent a reset code." };
  }

  async resetPassword(input: unknown): Promise<AuthResponse> {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((i) => i.message).join(" "));
    const user = await this.db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.emailVerifiedAt) throw new BadRequestException("That reset code is not valid.");
    await this.consumeOtp(user.id, parsed.data.code, "PASSWORD_RESET");
    await this.db.user.update({ where: { id: user.id }, data: { passwordHash: await this.hashPassword(parsed.data.newPassword) } });
    return this.authResponse(user.id, user.email, user.displayName);
  }

  async validateToken(token: string) {
    try {
      const [header, payloadPart, signature] = token.split(".");
      if (!header || !payloadPart || !signature) throw new Error();
      const expected = createHmac("sha256", this.jwtSecret).update(`${header}.${payloadPart}`).digest("base64url");
      if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error();
      const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as TokenPayload;
      if (!payload.sub || !payload.email || Date.now() >= payload.exp * 1000) throw new Error();
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException("Your session is not valid. Sign in again.");
    }
  }

  private authResponse(id: string, email: string, displayName: string | null): AuthResponse {
    return { token: this.generateToken(id, email), user: { id, email, displayName } };
  }

  private generateToken(userId: string, email: string) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: userId, email, exp: Math.floor(Date.now() / 1000) + 7 * 86_400 })).toString("base64url");
    const signature = createHmac("sha256", this.jwtSecret).update(`${header}.${payload}`).digest("base64url");
    return `${header}.${payload}.${signature}`;
  }

  private async sendBrevoEmail(to: string, code: string, purpose: OtpPurpose) {
    const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
    const port = Number(process.env.BREVO_SMTP_PORT || 587);
    const user = process.env.BREVO_SMTP_USER;
    const password = process.env.BREVO_SMTP_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!user || !password || !senderEmail) { this.logger.error("Brevo SMTP is not configured."); return false; }
    try {
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass: password },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      await transport.sendMail({
        from: { name: "Tcharize", address: senderEmail },
        to,
        subject: purpose === "SIGNUP" ? "Verify your Tcharize account" : "Reset your Tcharize password",
        html: `<div style="font-family:system-ui;max-width:500px;margin:auto;padding:24px"><h1 style="color:#801fff">Tcharize</h1><p>${purpose === "SIGNUP" ? "Use this code to finish signing up." : "Use this code to reset your password."}</p><p style="background:#9eff1f;color:#1d1427;font-size:30px;font-weight:700;letter-spacing:6px;padding:16px;text-align:center;border-radius:14px">${code}</p><p>This code ends in 10 minutes. Do not share it.</p></div>`,
      });
      return true;
    } catch (error) {
      this.logger.error(`Brevo email failed: ${error instanceof Error ? error.message : "unknown error"}`);
      return false;
    }
  }

  async assertOrganizationAccess(userId: string, organizationIdOrSlug: string) {
    const membership = await this.db.membership.findFirst({
      where: { userId, organization: { OR: [{ id: organizationIdOrSlug }, { slug: organizationIdOrSlug }] } },
      include: { organization: true },
    });
    if (!membership) throw new ForbiddenException("You cannot use this workspace.");
    return membership.organization;
  }

  async assertProjectAccess(userId: string, projectId: string) {
    const project = await this.db.project.findFirst({ where: { id: projectId, organization: { memberships: { some: { userId } } } } });
    if (!project) throw new ForbiddenException("You cannot use this project.");
    return project;
  }

  async assertProjectOrganizationAccess(organizationId: string, projectId: string) {
    const project = await this.db.project.findFirst({ where: { id: projectId, organizationId } });
    if (!project) throw new ForbiddenException("You cannot use this project.");
    return project;
  }

  async assertGlossaryAccess(userId: string, glossaryId: string) {
    const entry = await this.db.glossaryEntry.findFirst({
      where: { id: glossaryId, project: { organization: { memberships: { some: { userId } } } } },
    });
    if (!entry) throw new ForbiddenException("You cannot use this glossary item.");
    return entry;
  }

  async generateApiKey(userId: string, organizationId: string, name = "Default API Key") {
    const org = await this.assertOrganizationAccess(userId, organizationId);
    const rawKey = `tch_live_${randomBytes(24).toString("hex")}`;
    const key = await this.db.apiKey.create({ data: { organizationId: org.id, keyHash: createHash("sha256").update(rawKey).digest("hex"), prefix: `${rawKey.slice(0, 16)}...`, name } });
    return { id: key.id, name: key.name, prefix: key.prefix, key: rawKey, createdAt: key.createdAt };
  }

  async listApiKeys(userId: string, organizationId: string) {
    const org = await this.assertOrganizationAccess(userId, organizationId);
    return this.db.apiKey.findMany({ where: { organizationId: org.id, revokedAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true } });
  }

  async revokeApiKey(userId: string, keyId: string) {
    const key = await this.db.apiKey.findFirst({ where: { id: keyId, organization: { memberships: { some: { userId } } } } });
    if (!key) throw new NotFoundException("API key not found.");
    return this.db.apiKey.update({ where: { id: keyId }, data: { revokedAt: new Date() } });
  }

  async validateApiKey(rawKey: string) {
    const key = await this.db.apiKey.findUnique({ where: { keyHash: createHash("sha256").update(rawKey).digest("hex") }, include: { organization: true } });
    if (!key || key.revokedAt) return null;
    void this.db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
    return key.organization;
  }
}
