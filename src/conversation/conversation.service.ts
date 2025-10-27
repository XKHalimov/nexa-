// src/conversation/conversation.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { isUUID } from 'class-validator';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  // Yangi conversation yaratish
  async createConversation(dto: CreateConversationDto, creatorId: string) {
    if (!creatorId) throw new BadRequestException('Foydalanuvchi aniqlanmadi');

    const memberIds = Array.from(new Set([...(dto.memberIds || []), creatorId]));

    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });

    const existingIds = existingUsers.map(u => u.id);
    const missingIds = memberIds.filter(id => !existingIds.includes(id));
    if (missingIds.length > 0) throw new NotFoundException({ missingIds });

    const conversation = await this.prisma.$transaction(async (prisma) => {
      const conv = await prisma.conversation.create({
        data: {
          title: dto.title ?? null,
          isGroup: dto.isGroup ?? false,
          createdById: creatorId,
        },
      });

      const membersData = memberIds.map(id => ({ userId: id, conversationId: conv.id }));
      await prisma.conversationMember.createMany({ data: membersData, skipDuplicates: true });

      return prisma.conversation.findUnique({
        where: { id: conv.id },
        include: { members: { include: { user: true } } },
      });
    });

    if (!conversation) throw new InternalServerErrorException('Conversation yaratilgach qaytarilmadi');

    return { message: 'Conversation yaratildi', conversation };
  }

  async findUserConversations(userId: string) {
    if (!userId) throw new BadRequestException('userId kerak');

    const conversations = await this.prisma.conversation.findMany({
      where: { members: { some: { userId } }, isDeleted: false },
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: conversations.length ? 'Conversationlar topildi' : 'Conversation topilmadi',
      conversations,
    };
  }

  // Admin uchun barcha conversationlarni olish
  async findAllConversations() {
    const conversations = await this.prisma.conversation.findMany({
      where: { isDeleted: false },
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { message: 'Barcha conversationlar', conversations };
  }

  // Conversationni ID bo‘yicha olish (RBAC tekshiruvi uchun)
  async getConversationById(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: { include: { user: true } } },
    });

    if (!conversation) throw new NotFoundException('Conversation topilmadi');
    return conversation;
  }

  // A’zo qo‘shish
  async addMemberToConversation(conversationId: string, userId: string) {
    // 1️⃣ UUID tekshiruvi
    if (!isUUID(conversationId)) throw new BadRequestException('conversationId noto‘g‘ri UUID formatida');
    if (!isUUID(userId)) throw new BadRequestException('userId noto‘g‘ri UUID formatida');
  
    try {
      // 2️⃣ Conversation va User tekshiruvi
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { members: true },
      });
      if (!conversation) throw new NotFoundException('Conversation topilmadi');
  
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
  
      // 3️⃣ Prisma xatolarini ushlash
      let existing;
      try {
        existing = await this.prisma.conversationMember.findFirst({
          where: { conversationId, userId },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new BadRequestException('UUID format xato yoki boshqa Prisma xato');
        }
        throw error;
      }
  
      if (existing) return { message: 'Foydalanuvchi allaqachon a’zo' };
  
      await this.prisma.conversationMember.create({
        data: { conversationId, userId },
      });
  
      const updatedConversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { members: { include: { user: true } } },
      });
  
      return { message: 'Foydalanuvchi muvaffaqiyatli qo‘shildi', conversation: updatedConversation };
    } catch (err) {
      // 4️⃣ NestJS exceptions
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) throw err;
  
      console.error('addMemberToConversation error:', err);
      throw new InternalServerErrorException('A’zo qo‘shishda server xatosi yuz berdi.');
    }
  }
  
}
