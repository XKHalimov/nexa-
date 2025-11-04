import { IsUUID, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class AddXpDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  action: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  amount?: number;
}
