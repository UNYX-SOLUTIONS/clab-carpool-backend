-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_code_expires_at" TIMESTAMP(3),
ADD COLUMN     "verification_code_hash" TEXT;
