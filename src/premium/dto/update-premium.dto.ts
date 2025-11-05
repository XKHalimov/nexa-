import { PartialType } from '@nestjs/swagger';
import { CreatePremiumDto } from './create-premium.dto';

export class UpdatePremiumDto extends PartialType(CreatePremiumDto) {}
