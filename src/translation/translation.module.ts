import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { TranslationGateway } from './translation.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { TranslationProcessor } from './translation.processor';

@Module({
  controllers: [TranslationController],
  providers: [
    TranslationService,
    TranslationGateway,
    PrismaService,
    TranslationProcessor,
  ],
  exports: [TranslationService],
})
export class TranslationModule {}
