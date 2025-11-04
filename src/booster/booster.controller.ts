import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BoosterService } from './booster.service';
import { AddXpDto } from './dto/add-xp.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('booster')
@UseGuards(RolesGuard) 
export class BoosterController {
  constructor(private boosterService: BoosterService) {}

  @Post('add-xp')
  @Roles('admin') 
  async addXp(@Body() dto: AddXpDto) {
    return this.boosterService.addXp(dto.userId, dto.action, dto.amount ?? 10);
  }

  @Post('activate')
  @Roles('admin') 
  async activate(@Body() body: { userId: string; boosterId: string }) {
    return this.boosterService.activateBooster(body.userId, body.boosterId);
  }
}
