import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { BrevoEmailService } from "../../infrastructure/email/brevo-email.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, BrevoEmailService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
