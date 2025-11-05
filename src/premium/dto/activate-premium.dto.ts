import { IsString, IsNotEmpty } from 'class-validator';

export class ActivatePremiumDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  planType: string; 
}
