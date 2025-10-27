import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageGateway } from './message.gateway';
import { AuthModule } from '../auth/auth.module'; // 🟢 qo‘shildi

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ConversationModule),
    forwardRef(() => AuthModule), // 🟢 AuthModule import qilindi
  ],
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
  exports: [MessageService, MessageGateway],
})
export class MessageModule {}
