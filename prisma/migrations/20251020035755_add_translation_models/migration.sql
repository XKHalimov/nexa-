-- DropForeignKey
ALTER TABLE "public"."Translation" DROP CONSTRAINT "Translation_messageId_fkey";

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "error" TEXT,
ADD COLUMN     "provider" TEXT;

-- AlterTable
ALTER TABLE "TranslationOutbox" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "error" TEXT;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
