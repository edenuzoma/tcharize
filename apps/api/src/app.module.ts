import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { LocalizationModule } from "./modules/localization/localization.module";
import { SpeechModule } from "./modules/speech/speech.module";
import { BillingModule } from "./modules/billing/billing.module";
import { ContactModule } from "./modules/contact/contact.module";
import { validateEnvironment } from "./config/validate-environment";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env.local", "../../.env", ".env.local", ".env"],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    LocalizationModule,
    SpeechModule,
    BillingModule,
    ContactModule,
  ],
})
export class AppModule {}
