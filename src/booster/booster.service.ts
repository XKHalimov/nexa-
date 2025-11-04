// booster.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoosterService {
  constructor(private prisma: PrismaService) {}

  async activateBooster(userId: string, boosterId: string) {
    try {
      const booster = await this.prisma.booster.findUnique({
        where: { id: boosterId },
      });
      if (!booster) {
        throw new BadRequestException('Booster topilmadi');
      }

      const userBooster = await this.prisma.userBooster.findFirst({
        where: { userId, boosterId },
      });
      if (!userBooster) {
        throw new BadRequestException('Foydalanuvchi uchun booster topilmadi');
      }

      const updated = await this.prisma.userBooster.update({
        where: { id: userBooster.id },
        data: {
          active: true,
          expiresAt: new Date(Date.now() + booster.duration * 60 * 60 * 1000), 
        },
      });

      return {
        success: true,
        message: 'Booster faollashtirildi',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Booster faollashtirishda xatolik',
      };
    }
  }

  async addXp(userId: string, action: string, amount: number) {
    try {
      if (!userId || !action) throw new BadRequestException('UserId va action kerak');

      const xpLog = await this.prisma.xpLog.create({
        data: { userId, action, xpAmount: amount, createdAt: new Date() },
      });

      return {
        success: true,
        message: `XP qo'shildi: ${amount}`,
        data: xpLog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'XP qo\'shishda xatolik',
      };
    }
  }
}
