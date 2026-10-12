CREATE TYPE "OtpPurpose" AS ENUM ('SIGNUP', 'PASSWORD_RESET');

ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "passwordHash" IS NOT NULL;
ALTER TABLE "OtpCode" ADD COLUMN "purpose" "OtpPurpose" NOT NULL DEFAULT 'PASSWORD_RESET';
ALTER TABLE "OtpCode" ALTER COLUMN "purpose" DROP DEFAULT;

DROP INDEX IF EXISTS "OtpCode_userId_expiresAt_idx";
CREATE INDEX "OtpCode_userId_purpose_expiresAt_idx" ON "OtpCode"("userId", "purpose", "expiresAt");
