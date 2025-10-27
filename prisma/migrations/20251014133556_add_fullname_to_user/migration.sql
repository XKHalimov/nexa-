/*
  Warnings:

  - You are about to drop the column `fullName` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullName" TEXT NOT NULL DEFAULT '';
