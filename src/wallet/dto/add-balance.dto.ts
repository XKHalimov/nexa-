import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBalanceDto {
  @ApiProperty({ example: 'd7a3b546-12af-4e2b-b10a-12f3456abcd1' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 500, description: 'Balansga qo‘shiladigan miqdor' })
  @IsNumber()
  @Min(1)
  amount: number;
}
