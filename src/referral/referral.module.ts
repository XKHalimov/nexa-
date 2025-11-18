import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReferralRpc } from './referral.rpc';

@Module({
  controllers: [ReferralController, ReferralRpc],
  providers: [ReferralService, PrismaService],
  exports: [ReferralService],
})
export class ReferralModule {}
