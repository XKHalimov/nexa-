-- CreateTable
CREATE TABLE "booster" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "booster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_booster" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "boosterId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_booster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_booster" ADD CONSTRAINT "user_booster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_booster" ADD CONSTRAINT "user_booster_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "booster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
