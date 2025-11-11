import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { AddBalanceDto } from './dto/add-balance.dto';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Foydalanuvchining wallet balansini olish' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchining wallet maʼlumotlari',
    type: WalletResponseDto,
  })
  async getWallet(@Param('userId') userId: string) {
    try {
      return await this.walletService.getWallet(userId);
    } catch (xato) {
      console.error('Walletni olishda xato:', xato);
      throw new InternalServerErrorException(
        'Walletni olishda xatolik yuz berdi',
      );
    }
  }

  @Post('add')
  @ApiOperation({ summary: 'Foydalanuvchining balansiga mablag‘ qo‘shish' })
  @ApiResponse({ status: 200, description: 'Balans muvaffaqiyatli qo‘shildi' })
  async addBalance(@Body() dto: AddBalanceDto) {
    try {
      return await this.walletService.addBalance(dto.userId, dto.amount);
    } catch (xato) {
      console.error('Balans qo‘shishda xato:', xato);
      throw new InternalServerErrorException(
        'Balans qo‘shishda xatolik yuz berdi',
      );
    }
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Booster, premium yoki boshqa narsani sotib olish' })
  @ApiResponse({
    status: 200,
    description: 'Sotib olish muvaffaqiyatli amalga oshirildi',
  })
  async purchase(@Body() dto: PurchaseItemDto) {
    try {
      return await this.walletService.purchaseItem(
        dto.userId,
        dto.itemType,
        dto.itemId,
        dto.price,
      );
    } catch (xato) {
      console.error('Sotib olishda xato:', xato);
      throw new InternalServerErrorException('Sotib olishda xatolik yuz berdi');
    }
  }

  @Get('transactions/:userId')
  @ApiOperation({ summary: 'Foydalanuvchining barcha tranzaksiyalarini olish' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchining transaction loglari',
  })
  async getTransactions(@Param('userId') userId: string) {
    try {
      return await this.walletService.getTransactions(userId);
    } catch (xato) {
      console.error('Transaction loglarini olishda xato:', xato);
      throw new InternalServerErrorException(
        'Transaction loglarini olishda xatolik yuz berdi',
      );
    }
  }
}
