import { Controller, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async translate(@Body() body: any) {
    return this.translationService.translateText(
      body.text,
      body.sourceLang,
      body.targetLang,
    );
  }
}
