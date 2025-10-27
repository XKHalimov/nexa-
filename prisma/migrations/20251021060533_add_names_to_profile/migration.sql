/*
  Warnings:

  - You are about to drop the column `fullName` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
