import { Module } from "@nestjs/common";
import { BrevoEmailService } from "../../infrastructure/email/brevo-email.service";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { ContactController } from "./contact.controller";

@Module({
  imports: [RedisModule],
  controllers: [ContactController],
  providers: [BrevoEmailService],
})
export class ContactModule {}
