-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageId" TEXT;
