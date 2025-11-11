import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async addBalance(userId: string, amount: number) {
    try {
      let wallet = await this.prisma.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        wallet = await this.prisma.wallet.create({
          data: {
            userId,
            balance: 0,
          },
        });
      }

      const yangilangan = await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'ADD_BALANCE',
          amount,
        },
      });

      return {
        success: true,
        message: `Balans ${amount} ga oshirildi`,
        wallet: yangilangan,
      };
    } catch (xato) {
      console.error('Balans qo‘shishda xato:', xato);
      throw new InternalServerErrorException('Balans qo‘shishda xatolik yuz berdi');
    }
  }

  async purchaseItem(userId: string, itemType: string, itemId: string, price: number) {
    try {
      const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new NotFoundException('Foydalanuvchining hamyoni topilmadi');
      }

      if (wallet.balance < price) {
        throw new BadRequestException('Balans yetarli emas');
      }

      const yangilangan = await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: price } },
      });

      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: price,
          itemType,
          itemId,
        },
      });

      return {
        success: true,
        message: `${itemType} muvaffaqiyatli sotib olindi`,
        wallet: yangilangan,
      };
    } catch (xato) {
      console.error('Sotib olishda xato:', xato);
      throw new InternalServerErrorException('Sotib olishda xatolik yuz berdi');
    }
  }

  async getWallet(userId: string) {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new NotFoundException('Hamyon topilmadi');

      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        wallet: {
          ...wallet,
          transactions,
        },
      };
    } catch (xato) {
      console.error('Hamyonni olishda xato:', xato);
      throw new InternalServerErrorException('Hamyonni olishda xatolik yuz berdi');
    }
  }

  async getTransactions(userId: string) {
    try {
      const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Hamyon topilmadi');

      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        transactions,
      };
    } catch (xato) {
      console.error('Transaction loglarini olishda xato:', xato);
      throw new InternalServerErrorException('Transaction loglarini olishda xatolik yuz berdi');
    }
  }
}
