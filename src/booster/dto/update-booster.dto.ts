import { PartialType } from '@nestjs/swagger';
import { CreateBoosterDto } from './create-booster.dto';

export class UpdateBoosterDto extends PartialType(CreateBoosterDto) {}
