import { Module } from "@nestjs/common";
import { SpeechController } from "./speech.controller";
import { SpeechService } from "./speech.service";
import { AuthModule } from "../auth/auth.module";
import { LocalizationModule } from "../localization/localization.module";

@Module({ imports: [AuthModule, LocalizationModule], controllers: [SpeechController], providers: [SpeechService] })
export class SpeechModule {}
