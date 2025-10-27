/*
  Warnings:

  - You are about to drop the `Translation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Translation" DROP CONSTRAINT "Translation_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TranslationOutbox" DROP CONSTRAINT "TranslationOutbox_translationId_fkey";

-- DropTable
DROP TABLE "public"."Translation";

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "translatedText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationOutbox" ADD CONSTRAINT "TranslationOutbox_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
