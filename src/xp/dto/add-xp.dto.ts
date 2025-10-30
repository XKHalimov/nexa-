import { IsString, IsOptional, IsNumber } from 'class-validator';

export class AddXpDto {
  @IsString()
  userId: string; 

  @IsString()
  action: string;

  @IsOptional()
  @IsNumber()
  xpAmount?: number; 
}
