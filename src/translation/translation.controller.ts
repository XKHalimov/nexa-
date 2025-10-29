import { Controller, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslateDto } from './dto/translate.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Translation')
@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  @ApiOperation({ summary: 'Matnni tarjima qilish' })
  async translate(@Body() dto: TranslateDto) {
    return this.translationService.translateText(
      dto.text,
      dto.sourceLang,
      dto.targetLang,
    );
  }
}
