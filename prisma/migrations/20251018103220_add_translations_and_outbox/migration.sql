-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "translatedText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationOutbox" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "TranslationOutbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationOutbox" ADD CONSTRAINT "TranslationOutbox_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
