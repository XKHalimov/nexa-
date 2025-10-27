import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetUser } from 'src/auth/strategy/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // ✅ Yangi conversation yaratish
  @Post()
  async createConversation(
    @Body() dto: CreateConversationDto,
    @GetUser() user: any, // user: { userId, role }
  ) {
    // RBAC: user va admin yaratishi mumkin
    return await this.conversationService.createConversation(dto, user.userId);
  }

  // ✅ Foydalanuvchining conversationlarini olish
  @Get()
  async getMyConversations(@GetUser() user: any) {
    // Admin barcha conversationlarni ko‘rishi mumkin
    console.log(user)
    if (user.role === 'admin') {
      const conversations = await this.conversationService.findAllConversations();
      return {
        message: 'Barcha conversationlar muvaffaqiyatli olindi',
        conversations,
      };
    }
  
    // Oddiy user faqat o‘z conversationlarini ko‘radi
    const conversations = await this.conversationService.findUserConversations(user.userId);
    return {
      message: 'Foydalanuvchining conversationlari muvaffaqiyatli olindi',
      conversations,
    };
  }
  
  // ✅ Conversation ga yangi a’zo qo‘shish
  @Post(':conversationId/members')
  async addMember(
    @Param('conversationId') conversationId: string,
    @Body('userId') newUserId: string,
    @GetUser() user: any,
  ) {
    // RBAC: faqat admin yoki conversation yaratuvchisi qo‘shishi mumkin
    const conversation = await this.conversationService.getConversationById(conversationId);

    if (user.role !== 'admin' && conversation.createdById !== user.userId) {
      throw new ForbiddenException('Siz bu conversation ga a’zo qo‘sha olmaysiz');
    }

    return this.conversationService.addMemberToConversation(conversationId, newUserId);
  }
}
