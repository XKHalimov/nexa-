import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class XpService {
  constructor(private prisma: PrismaService) {}

  // Foydalanuvchining jami XP sini olish
  async getUserXp(userId: string) {
    const result = await this.prisma.xpLog.aggregate({
      _sum: { xpAmount: true },
      where: { userId },
    });
    return result._sum.xpAmount ?? 0;
  }

  // Foydalanuvchining XP darajasini hisoblash
  async getUserXpLevel(userId: string) {
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
  }

  // XP qo'shish
  async addXp(userId: string, action: string, xpAmount?: number) {
    if (!userId || !action) {
      throw new BadRequestException('UserId va action kiritilishi kerak.');
    }

    const xp = xpAmount ?? 10;

    const xpLog = await this.prisma.xpLog.create({
      data: {
        userId,
        action,
        xpAmount: xp,
        createdAt: new Date(),
      },
    });

    return {
      message: `XP qo'shildi: ${xp}`,
      xpLog,
    };
  }
}
