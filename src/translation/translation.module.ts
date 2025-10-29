import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { TranslationGateway } from './translation.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { TranslationProcessor } from './translation.processor';

@Module({
  imports: [ScheduleModule.forRoot()],
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
