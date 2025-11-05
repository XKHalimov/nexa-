import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PremiumService } from './premium.service';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('activate')
  async activatePremium(@Body() body: { userId: string; planType: 'monthly' | 'yearly' }) {
    const { userId, planType } = body;
    if (!userId || !planType) {
      throw new BadRequestException('User ID yoki planType kiritilmagan');
    }
    return await this.premiumService.activatePremium(userId, planType);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status/:userId')
  async getPremiumStatus(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID kiritilmagan');
    return await this.premiumService.getPremiumStatus(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('deactivate-expired')
  async deactivateExpiredPremiums() {
    return await this.premiumService.deactivateExpiredPremiums();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('grant-auto/:userId')
  async grantAutoPremium(@Param('userId') userId: string) {
    return await this.premiumService.grantAutoPremiumIfEligible(userId);
  }
}
