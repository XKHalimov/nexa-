/*
  Warnings:

  - Added the required column `planType` to the `premium_subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "premium_subscriptions" ADD COLUMN     "planType" TEXT NOT NULL;
