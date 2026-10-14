import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { DatabaseService } from "../../infrastructure/database/database.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly db: DatabaseService,
  ) {}

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.loginWithPassword(body);
    this.setSessionCookie(response, result.token);
    return result;
  }

  @Post("signup")
  async signup(@Body() body: unknown) {
    return this.authService.signupWithPassword(body);
  }

  @Post("signup/verify")
  async verifySignup(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.verifySignup(body);
    this.setSessionCookie(response, result.token);
    return result;
  }

  @Post("reset-password")
  async resetPassword(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.resetPassword(body);
    this.setSessionCookie(response, result.token);
    return result;
  }

  @Post("forgot-password/request")
  async requestPasswordReset(@Body() body: unknown) {
    return this.authService.requestOtp(body);
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("tcharize_session", { path: "/" });
    return { message: "You are signed out." };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async getMe(@Req() req: { user: { id: string; email: string } }) {
    const user = await this.db.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    _count: { select: { jobs: true, glossaries: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return { user };
  }

  @Get("keys/:orgId")
  @UseGuards(AuthGuard)
  async listKeys(@Param("orgId") orgId: string, @Req() req: { user: { id: string } }) {
    return this.authService.listApiKeys(req.user.id, orgId);
  }

  @Post("keys")
  @UseGuards(AuthGuard)
  async generateKey(@Body() body: { organizationId: string; name?: string }, @Req() req: { user: { id: string } }) {
    return this.authService.generateApiKey(req.user.id, body.organizationId, body.name);
  }

  @Delete("keys/:keyId")
  @UseGuards(AuthGuard)
  async revokeKey(@Param("keyId") keyId: string, @Req() req: { user: { id: string } }) {
    return this.authService.revokeApiKey(req.user.id, keyId);
  }

  private setSessionCookie(response: Response, token: string) {
    response.cookie("tcharize_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
