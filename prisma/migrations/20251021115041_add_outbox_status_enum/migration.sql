/*
  Warnings:

  - The `status` column on the `TranslationOutbox` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('queued', 'processing', 'processed', 'failed');

-- AlterTable
ALTER TABLE "TranslationOutbox" DROP COLUMN "status",
ADD COLUMN     "status" "OutboxStatus" NOT NULL DEFAULT 'queued';
