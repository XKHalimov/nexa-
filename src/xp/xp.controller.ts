import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { XpService } from './xp.service';
import { GetUser } from 'src/auth/strategy/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { AddXpDto } from './dto/add-xp.dto';
import type { UserToken } from 'src/auth/dto/user-token.interface';

@Controller('xp')
export class XpController {
  constructor(
    private readonly xpService: XpService,
    // private readonly aiService: AiService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addXp(@Body() body: AddXpDto, @GetUser() user: UserToken) {
    const userId = body.userId ?? user.userId;
    return this.xpService.addXp(userId, body.action, body.xpAmount);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyXp(@GetUser() user: UserToken) {
    const totalXp = await this.xpService.getUserXp(user.userId);
    return { userId: user.userId, totalXp };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/level')
  async getMyXpLevel(@GetUser() user: UserToken) {
    return this.xpService.getUserXpLevel(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/status')
  async getMyStatus(@GetUser() user: UserToken) {
    return this.xpService.getUserXpLevel(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/status')
  async getUserStatus(@Param('userId') userId: string) {
    return this.xpService.getUserStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('limit')
  async getLimit(@GetUser() user: UserToken) {
    return this.xpService.getAiLimits(user.userId);
  }
}
