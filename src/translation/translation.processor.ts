import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TranslationService } from './translation.service';
import { TranslationGateway } from './translation.gateway';

interface TranslationPayload {
  text: string;
  source: string;
  target: string;
}

@Injectable()
export class TranslationProcessor {
  private readonly logger = new Logger(TranslationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly translationGateway: TranslationGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processQueuedTranslations(): Promise<void> {
    const queuedOutboxes = await this.prisma.translationOutbox.findMany({
      where: { status: 'queued' },
      take: 5,
      include: { translation: true },
    });

    if (!queuedOutboxes.length) return;

    this.logger.log(`${queuedOutboxes.length} ta tarjima qayta ishlanmoqda...`);

    for (const outbox of queuedOutboxes) {
      await this.processOutboxItem(outbox);
    }
  }

  private async processOutboxItem(outbox: any): Promise<void> {
    try {
      // 1️⃣ Outbox statusini processing ga o‘zgartiramiz
      await this.prisma.translationOutbox.update({
        where: { id: outbox.id },
        data: { status: 'processing' },
      });
  
      // 2️⃣ Payloadni olish va tekshirish
      const payload = outbox.payload as TranslationPayload;
      if (!payload?.text || !payload?.source || !payload?.target) {
        throw new Error('Payload maʼlumotlari toʻliq emas');
      }
  
      // 3️⃣ Tarjima qilish
      const result = await this.translationService.translateText(
        payload.text,
        payload.source,
        payload.target,
      );
  
      const translatedText =
        typeof result === 'string' ? result : result.translatedText;
  
      if (!translatedText) {
        throw new Error('Tarjima natijasi bo‘sh');
      }
  
      // 4️⃣ Translation jadvalini update qilish
      await this.prisma.translation.update({
        where: { id: outbox.translationId },
        data: {
          translatedText,
          status: 'processed',
        },
      });
  
      // 5️⃣ Outbox statusini update qilish
      await this.prisma.translationOutbox.update({
        where: { id: outbox.id },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });
  
      // 6️⃣ ❗ Shu yerda WebSocket orqali foydalanuvchiga yuborish
      this.translationGateway.sendTranslationUpdate({
        messageId: outbox.translation.messageId,
        translatedText,
      });
  
      this.logger.log(`Tarjima yakunlandi: ${outbox.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Nomaʼlum xatolik';
  
      this.logger.error(`Tarjima xatosi [${outbox.id}]: ${errorMessage}`);
  
      await this.prisma.translationOutbox.update({
        where: { id: outbox.id },
        data: {
          status: 'failed',
          attempts: { increment: 1 },
          error: errorMessage,
        },
      });
    }
  }
  
}
