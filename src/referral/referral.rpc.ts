import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller()
export class ReferralRpc {
  constructor(private readonly prisma: PrismaService) {}

  @MessagePattern('getReferralStats')
  async getReferralStats(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    const { userId } = data;

    const totalReferrals = await this.prisma.referral.count({
      where: { referrerId: userId },
    });

    const rewardType = process.env.REFERRAL_REWARD_TYPE || 'xp';
    const rewardValue = rewardType === 'xp' ? 100 : 10;

    return {
      userId,
      totalReferrals,
      totalReward: totalReferrals * rewardValue,
      rewardType,
    };
  }
}
