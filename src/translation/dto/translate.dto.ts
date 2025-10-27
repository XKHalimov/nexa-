import { IsString } from 'class-validator';

export class TranslateDto {
  @IsString()
  messageId: string;

  @IsString()
  sourceLang: string;

  @IsString()
  targetLang: string;

  @IsString()
  text: string;
}
