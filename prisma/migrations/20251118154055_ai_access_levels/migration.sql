-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiAccessLevelId" TEXT;

-- CreateTable
CREATE TABLE "AiAccessLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chatLimit" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "xpFrom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAccessLevel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_aiAccessLevelId_fkey" FOREIGN KEY ("aiAccessLevelId") REFERENCES "AiAccessLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
