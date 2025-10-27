import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly GEMINI_URL =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';

  private readonly API_KEY = process.env.GEMINI_API_KEY;

  async translateText(text: string, sourceLang: string, targetLang: string) {
    try {
      const prompt = `Translate this text from ${sourceLang} to ${targetLang}. Only return the translated text, no explanations, no formatting: "${text}"`;

      const response = await axios.post(
        `${this.GEMINI_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!rawText) {
        throw new Error('Gemini translation failed: no text returned');
      }

      const cleaned = rawText
        .replace(/\*\*/g, '') 
        .replace(/\*.*?\*/g, '') 
        .replace(/[\n\r]+/g, ' ') 
        .replace(/.*?:\s*/g, '') 
        .trim();

      const firstLine = cleaned.split(/[.!?]/)[0].trim();

      return { translatedText: firstLine };
    } catch (error) {
      this.logger.error(
        `❌ Gemini translation error:`,
        error.response?.data || error.message,
      );
      throw new Error('Translation failed');
    }
  }
}
