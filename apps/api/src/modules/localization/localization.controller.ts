import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type {
  BatchTranslateResponse,
  TranslateResponse,
} from "@tcharize/contracts";
import { LocalizationService } from "./localization.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { RateLimitService } from "../../infrastructure/redis/rate-limit.service";

@Controller("localization")
export class LocalizationController {
  constructor(
    private readonly localizationService: LocalizationService,
    private readonly authService: AuthService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post("translate")
  async translate(@Body() body: unknown, @Req() req: Request): Promise<TranslateResponse> {
    const projectId = typeof body === "object" && body !== null && "projectId" in body && typeof body.projectId === "string"
      ? body.projectId
      : undefined;
    const { bearer, organizationId } = await this.resolveOrganization(req, projectId);
    if (!organizationId && !this.isFirstPartyRequest(req)) {
      throw new UnauthorizedException("Use a Tcharize API key for product translations.");
    }

    const identity = bearer ?? req.ip ?? req.socket.remoteAddress ?? "unknown";
    await this.rateLimit.consume(organizationId ? "workspace-translate" : "public-translate", identity, organizationId ? 120 : 30, 60);
    return this.localizationService.translate(body, organizationId);
  }

  @Post("page")
  async translatePage(@Body() body: { texts?: unknown; targetLanguage?: unknown }, @Req() req: Request) {
    if (!Array.isArray(body.texts) || body.texts.length < 1 || body.texts.length > 150 ||
      !body.texts.every((text) => typeof text === "string" && text.trim().length > 0 && text.length <= 500)) {
      throw new BadRequestException("Add up to 150 short text items.");
    }
    if (typeof body.targetLanguage !== "string" || !["ha", "ig", "yo", "pcm"].includes(body.targetLanguage)) {
      throw new BadRequestException("Choose Hausa, Igbo, Yoruba, or Nigerian Pidgin.");
    }
    const { bearer, organizationId } = await this.resolveOrganization(req);
    if (!organizationId && !this.isFirstPartyRequest(req)) {
      throw new UnauthorizedException("Add your Tcharize API key to translate another website.");
    }
    const identity = bearer ?? req.ip ?? req.socket.remoteAddress ?? "unknown";
    await this.rateLimit.consume(organizationId ? "workspace-page-translate" : "public-page-translate", identity, organizationId ? 120 : 30, 60);
    return { translations: await this.localizationService.translatePage(body.texts, body.targetLanguage, organizationId) };
  }

  @Post("batch")
  @UseGuards(AuthGuard)
  async batchTranslate(@Body() body: { projectId?: string }, @Req() req: { user: { id: string } }): Promise<BatchTranslateResponse> {
    if (!body.projectId) throw new BadRequestException("Choose a project first.");
    const project = await this.authService.assertProjectAccess(req.user.id, body.projectId);
    return this.localizationService.batchTranslate(body, project.organizationId);
  }

  @Get("jobs")
  @UseGuards(AuthGuard)
  async listJobs(@Query("projectId") projectId: string | undefined, @Req() req: { user: { id: string } }) {
    if (!projectId) throw new BadRequestException("Choose a project first.");
    await this.authService.assertProjectAccess(req.user.id, projectId);
    return this.localizationService.listJobs(projectId);
  }

  @Get("glossary")
  @UseGuards(AuthGuard)
  async listGlossary(@Query("projectId") projectId: string, @Req() req: { user: { id: string } }) {
    await this.authService.assertProjectAccess(req.user.id, projectId);
    return this.localizationService.listGlossary(projectId);
  }

  @Post("glossary")
  @UseGuards(AuthGuard)
  async addGlossary(@Body() body: { projectId?: string }, @Req() req: { user: { id: string } }) {
    if (!body.projectId) throw new BadRequestException("Choose a project first.");
    await this.authService.assertProjectAccess(req.user.id, body.projectId);
    return this.localizationService.addGlossary(body);
  }

  @Delete("glossary/:id")
  @UseGuards(AuthGuard)
  async deleteGlossary(@Param("id") id: string, @Req() req: { user: { id: string } }) {
    await this.authService.assertGlossaryAccess(req.user.id, id);
    return this.localizationService.deleteGlossary(id);
  }

  private async resolveOrganization(req: Request, projectId?: string) {
    const authorization = req.headers.authorization;
    const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;
    const cookieToken = req.headers.cookie
      ?.split(";")
      .map((part) => part.trim().split("="))
      .find(([name]) => name === "tcharize_session")?.[1];

    if (bearer?.startsWith("tch_live_")) {
      const organization = await this.authService.validateApiKey(bearer);
      if (!organization) throw new UnauthorizedException("That API key is not valid.");
      if (projectId) await this.authService.assertProjectOrganizationAccess(organization.id, projectId);
      return { bearer, organizationId: organization.id };
    }

    if (bearer || cookieToken) {
      const user = await this.authService.validateToken(bearer ?? decodeURIComponent(cookieToken ?? ""));
      if (projectId) {
        const project = await this.authService.assertProjectAccess(user.id, projectId);
        return { bearer, organizationId: project.organizationId };
      }
      return { bearer, organizationId: await this.authService.getDefaultOrganizationId(user.id) };
    }

    return { bearer: undefined, organizationId: undefined };
  }

  private isFirstPartyRequest(req: Request) {
    const origin = req.headers.origin;
    if (!origin) return false;
    const allowed = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return allowed.includes(origin);
  }
}
