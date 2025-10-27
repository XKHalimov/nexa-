import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TranslationProcessor } from './translation/translation.processor';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const processor = appContext.get(TranslationProcessor);

  setInterval(async () => {
    try {
      await processor.processQueuedTranslations();
    } catch (err) {
      console.error('Xatolik yuz berdi:', err);
    }
  }, 5000);
}

bootstrap();
