import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateDto {
  @ApiProperty({ example: 'Hello', description: 'Matn' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'en', description: 'Manba til (sourceLang)' })
  @IsString()
  sourceLang: string;

  @ApiProperty({ example: 'uz', description: 'Maqsad til (targetLang)' })
  @IsString()
  targetLang: string;
}
