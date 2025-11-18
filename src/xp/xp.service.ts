import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class XpService {
  constructor(private prisma: PrismaService) {}

  async getUserXp(userId: string) {
    try {
      const result = await this.prisma.xpLog.aggregate({
        _sum: { xpAmount: true },
        where: { userId },
      });
      return result._sum.xpAmount ?? 0;
    } catch (error) {
      console.error('getUserXp error:', error);
      throw new InternalServerErrorException('XP olishda xatolik yuz berdi.');
    }
  }

  async getUserXpLevel(userId: string) {
    try {
      const totalXp = await this.getUserXp(userId);
      const level = Math.floor(Math.sqrt(totalXp / 100));
      const nextLevelXp = (level + 1) ** 2 * 100;

      return {
        userId,
        totalXp,
        level,
        nextLevelXp,
        xpToNext: nextLevelXp - totalXp,
      };
    } catch (error) {
      console.error('getUserXpLevel error:', error);
      throw new InternalServerErrorException(
        'Level hisoblashda xatolik yuz berdi.',
      );
    }
  }

  async addXp(userId: string, action: string, xpAmount?: number) {
    if (!userId || !action) {
      throw new BadRequestException('UserId va action kiritilishi kerak.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User topilmadi: ${userId}`);
    }

    try {
      const xp = xpAmount ?? 10;

      const xpLog = await this.prisma.xpLog.create({
        data: {
          userId,
          action,
          xpAmount: xp,
          createdAt: new Date(),
        },
      });

      const totalXp = await this.getUserXp(userId);
      await this.checkAndUnlockBadges(userId, totalXp);

      return {
        message: `XP qo'shildi: ${xp}`,
        xpLog,
        totalXp,
      };
    } catch (error) {
      console.error('addXp error:', error);
      throw new InternalServerErrorException(
        'XP qo‘shishda xatolik yuz berdi.',
      );
    }
  }

  private async checkAndUnlockBadges(userId: string, totalXp: number) {
    try {
      const badges = await this.prisma.badge.findMany();

      for (const badge of badges) {
        const conditionXp = parseInt(badge.condition, 10);
        if (isNaN(conditionXp)) continue;

        const hasBadge = await this.prisma.userBadge.findFirst({
          where: { userId, badgeId: badge.id },
        });

        if (totalXp >= conditionXp && !hasBadge) {
          await this.prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          console.log(`Badge berildi: ${badge.name} foydalanuvchiga ${userId}`);
        }
      }
    } catch (error) {
      console.error('checkAndUnlockBadges error:', error);
      throw new InternalServerErrorException(
        'Badge tekshirishda xatolik yuz berdi.',
      );
    }
  }

  async getUserStatus(userId: string) {
    try {
      const xpLevel = await this.getUserXpLevel(userId);
      const badges = await this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      });

      return {
        ...xpLevel,
        badges: badges.map((ub) => ub.badge),
      };
    } catch (error) {
      console.error('getUserStatus error:', error);
      throw new InternalServerErrorException(
        'Foydalanuvchi statusini olishda xatolik yuz berdi.',
      );
    }
  }
  async assignAiAccessLevel(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
    const level = await this.prisma.aiAccessLevel.findFirst({
      where: {
        xpFrom: { lte: user?.xp }
      },
      orderBy: { xpFrom: 'desc' } 
    });
  
    await this.prisma.user.update({
      where: { id: userId },
      data: { aiAccessLevelId: level?.id }
    });
  
    return level;
  }

  async getAiLimits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { aiAccessLevel: true }
    });
  
    if (user?.isPremium) {
      return {
        level: 'Premium',
        chatLimit: Infinity,
        speed: 3
      };
    }
  
    return {
      level: user?.aiAccessLevel?.name,
      chatLimit: user?.aiAccessLevel?.chatLimit,
      speed: user?.aiAccessLevel?.speed
    };
  }
  
  
}
