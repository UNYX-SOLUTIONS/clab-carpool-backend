-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_code_attempts" INTEGER NOT NULL DEFAULT 0;
