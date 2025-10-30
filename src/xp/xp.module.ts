import { Module } from '@nestjs/common';
import { XpService } from './xp.service';
import { XpController } from './xp.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [XpController],
  providers: [XpService, PrismaService],
})
export class XpModule {}
