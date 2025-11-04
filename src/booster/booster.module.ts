import { Module } from '@nestjs/common';
import { BoosterService } from './booster.service';
import { BoosterController } from './booster.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [BoosterController],
  providers: [BoosterService],
})
export class BoosterModule {}
