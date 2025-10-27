/*
  Warnings:

  - You are about to drop the `TranslationOutbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TranslationOutbox" DROP CONSTRAINT "TranslationOutbox_translationId_fkey";

-- DropTable
DROP TABLE "public"."TranslationOutbox";

-- CreateTable
CREATE TABLE "translation_outbox" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "translation_outbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "translation_outbox" ADD CONSTRAINT "translation_outbox_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
