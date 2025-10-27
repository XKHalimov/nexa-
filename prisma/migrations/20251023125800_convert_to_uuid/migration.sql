/*
  Warnings:

  - The primary key for the `conversation_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `conversations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `createdById` column on the `conversations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lastMessageId` column on the `conversations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `translation_outbox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `conversation_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conversationId` on the `conversation_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `conversation_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `conversations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conversationId` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `senderId` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `translation_outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `translationId` on the `translation_outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `translations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `messageId` on the `translations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."conversation_members" DROP CONSTRAINT "conversation_members_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_members" DROP CONSTRAINT "conversation_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."translation_outbox" DROP CONSTRAINT "translation_outbox_translationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."translations" DROP CONSTRAINT "translations_messageId_fkey";

-- AlterTable
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "conversationId",
ADD COLUMN     "conversationId" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "createdById",
ADD COLUMN     "createdById" UUID,
DROP COLUMN "lastMessageId",
ADD COLUMN     "lastMessageId" UUID,
ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "conversationId",
ADD COLUMN     "conversationId" UUID NOT NULL,
DROP COLUMN "senderId",
ADD COLUMN     "senderId" UUID NOT NULL,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "translation_outbox" DROP CONSTRAINT "translation_outbox_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "translationId",
ADD COLUMN     "translationId" UUID NOT NULL,
ADD CONSTRAINT "translation_outbox_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "translations" DROP CONSTRAINT "translations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "messageId",
ADD COLUMN     "messageId" UUID NOT NULL,
ADD CONSTRAINT "translations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conversationId_userId_key" ON "conversation_members"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_outbox" ADD CONSTRAINT "translation_outbox_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
