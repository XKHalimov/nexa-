import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PremiumService } from './premium.service';

@Injectable()
export class PremiumCron {
  constructor(private premiumService: PremiumService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredPremiums() {
    try {
      await this.premiumService.deactivateExpiredPremiums();
    } catch (error) {
      console.error('Cron job xatosi:', error);
    }
  }
}
