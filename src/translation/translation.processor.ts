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
  async handleQueuedTranslations(): Promise<void> {
    try {
      const queuedOutboxes = await this.prisma.translationOutbox.findMany({
        where: { status: 'queued' },
        take: 5,
        include: { translation: true },
      });

      if (!queuedOutboxes.length) return;

      this.logger.log(
        `${queuedOutboxes.length} ta tarjima qayta ishlanmoqda...`,
      );

      for (const outbox of queuedOutboxes) {
        await this.processOutboxItem(outbox);
      }
    } catch (err) {
      this.logger.error(`handleQueuedTranslations xatolik: ${err.message}`);
    }
  }

  
  private async processOutboxItem(outbox: any): Promise<void> {
    try {
      await this.prisma.translationOutbox.update({
        where: { id: outbox.id },
        data: { status: 'processing' },
      });

      const payload = outbox.payload as TranslationPayload;
      if (!payload?.text || !payload?.source || !payload?.target) {
        throw new Error('Payload maʼlumotlari to‘liq emas');
      }

      const result = await this.translationService.translateText(
        payload.text,
        payload.source,
        payload.target,
      );

      const translatedText =
        typeof result === 'string' ? result : result.translatedText;

      if (!translatedText) throw new Error('Tarjima natijasi bo‘sh');

      await this.prisma.translation.update({
        where: { id: outbox.translationId },
        data: {
          translatedText,
          status: 'processed',
        },
      });

      await this.prisma.translationOutbox.update({
        where: { id: outbox.id },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });

      if (outbox.translation?.messageId) {
        this.translationGateway.sendTranslationUpdate({
          messageId: outbox.translation.messageId,
          translatedText,
        });
      }

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
