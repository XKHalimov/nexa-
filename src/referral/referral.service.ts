import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: { referred: true },
    });

    const rewardType = process.env.REFERRAL_REWARD_TYPE || 'xp';
    const rewardValue = rewardType === 'xp' ? 100 : 10;

    return {
      totalReferrals: referrals.length,
      totalReward: referrals.length * rewardValue,
      referredUsers: referrals.map(r => ({
        id: r.referred.id,
        email: r.referred.email,
        username: r.referred.username,
        createdAt: r.createdAt,
      })),
    };
  }
}
