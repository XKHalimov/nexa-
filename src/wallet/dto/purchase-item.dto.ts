import { IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty({ example: 'd7a3b546-12af-4e2b-b10a-12f3456abcd1' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'booster',
    description: 'Sotib olinayotgan narsa turi (booster | premium | xp)',
  })
  @IsString()
  itemType: string;

  @ApiProperty({ example: 'b84c9a21-5f7b-47ab-9e5e-08f52f8b7a8c' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ example: 100, description: 'Narx summasi' })
  @IsNumber()
  @Min(1)
  price: number;
}
