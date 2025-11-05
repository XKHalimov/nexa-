import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PremiumCron } from './premium.cron';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService,PrismaService,PremiumCron],
  exports:[PremiumService]
})
export class PremiumModule {}
