import { Module } from "@nestjs/common";
import { LocalizationController } from "./localization.controller";
import { LocalizationService } from "./localization.service";
import { NatlasAdapter } from "./adapters/natlas.adapter";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [LocalizationController],
  providers: [LocalizationService, NatlasAdapter],
  exports: [LocalizationService],
})
export class LocalizationModule {}

