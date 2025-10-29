import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ConversationModule } from './conversation/conversation.module';
import { SetCurrentUserMiddleware } from './middleware/set-current-user.middleware';
import { MessageModule } from './message/message.module';
import { TranslationModule } from './translation/translation.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // ✅ Schedule faqat bir marta ishlatiladi
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ConversationModule,
    MessageModule,
    TranslationModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetCurrentUserMiddleware).forRoutes('*');
  }
}
