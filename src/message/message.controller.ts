// src/message/message.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/strategy/get-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('conversationId') conversationId: string,
    @Body('content') content: string,
    @GetUser() user: any,
  ) {
    return this.messageService.createMessage(
      conversationId,
      user.userId,
      content,
    );
  }

  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @GetUser() user: any,
  ) {
    return this.messageService.getMessages(conversationId, user);
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @GetUser() user: any,
  ) {
    return this.messageService.deleteMessage(messageId, user);
  }
}
