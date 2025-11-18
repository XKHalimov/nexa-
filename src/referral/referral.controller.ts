import { Controller, Get, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get referral statistics by user ID' })
  async getStats(@Param('userId') userId: string) {
    return this.referralService.getStats(userId);
  }
}
