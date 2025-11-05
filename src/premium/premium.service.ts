import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PremiumService {
  
  private readonly planPrices = {
    monthly: 5, 
    yearly: 50,  
  };

  constructor(private prisma: PrismaService) {}

  async activatePremium(userId: string, planType: 'monthly' | 'yearly') {
    try {
      if (!userId || !planType) {
        throw new BadRequestException('User ID yoki planType kiritilmagan');
      }

      if (!this.planPrices[planType]) {
        throw new BadRequestException('Noto‘g‘ri plan turi');
      }

      const duration = planType === 'monthly' ? 30 : 365;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      const premium = await this.prisma.premiumSubscription.upsert({
        where: { userId },
        update: { planType, endDate, isActive: true },
        create: { userId, planType, endDate, isActive: true },
      });

      return {
        message: 'Premium muvaffaqiyatli faollashtirildi',
        data: premium,
        price: this.planPrices[planType],
      };
    } catch (error) {
      console.error('activatePremium xatosi:', error);
      throw new InternalServerErrorException('Premium faollashtirishda xatolik yuz berdi');
    }
  }

  async getPremiumStatus(userId: string) {
    try {
      if (!userId) throw new BadRequestException('User ID kiritilmagan');

      const sub = await this.prisma.premiumSubscription.findUnique({
        where: { userId },
      });

      if (!sub || !sub.isActive) {
        return { isPremium: false };
      }

      return {
        isPremium: true,
        planType: sub.planType,
        endDate: sub.endDate,
      };
    } catch (error) {
      console.error('getPremiumStatus xatosi:', error);
      throw new InternalServerErrorException('Premium statusni olishda xatolik yuz berdi');
    }
  }

  async deactivateExpiredPremiums() {
    try {
      const result = await this.prisma.premiumSubscription.updateMany({
        where: {
          endDate: { lt: new Date() },
          isActive: true,
        },
        data: { isActive: false },
      });

      return {
        message: `Muddati tugagan premiumlar deaktivatsiya qilindi: ${result.count} ta`,
      };
    } catch (error) {
      console.error('deactivateExpiredPremiums xatosi:', error);
      throw new InternalServerErrorException('Premiumlarni deaktivatsiya qilishda xatolik yuz berdi');
    }
  }


  async grantAutoPremiumIfEligible(userId: string) {
    try {
      const xp = await this.prisma.xpLog.aggregate({
        _sum: { xpAmount: true },
        where: { userId },
      });

      const totalXp = xp._sum?.xpAmount || 0;

      if (totalXp >= 1000) {
        const existing = await this.prisma.premiumSubscription.findUnique({
          where: { userId },
        });

        if (!existing || !existing.isActive) {
          return await this.activatePremium(userId, 'monthly');
        }
      }

      return { message: 'Premium shart bajarilmadi yoki allaqachon mavjud' };
    } catch (error) {
      console.error('grantAutoPremiumIfEligible xatosi:', error);
      throw new InternalServerErrorException('Avtomatik premium berishda xatolik yuz berdi');
    }
  }
}
