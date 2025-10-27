import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageGateway: MessageGateway,
  ) {}

  // Xabar yaratish
  async createMessage(conversationId: string, userId: string, content: string) {
    if (!userId) throw new BadRequestException('User (foydalanuvchi) aniqlanmadi.');

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true }, // RBAC tekshiruvi uchun
    });
    if (!conversation) throw new NotFoundException('Conversation topilmadi');

    // User conversation a'zosi ekanligini tekshirish (RBAC)
    const isMember = conversation.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException("Siz bu conversation uchun xabar yozolmaysiz");

    await this.prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_user_id', '${userId}', false);`,
    );

    const message = await this.prisma.message.create({
      data: {
        content,
        sender: { connect: { id: userId } },
        conversation: { connect: { id: conversationId } },
      },
      include: {
        sender: true,
      },
    });

    const translation = await this.prisma.translation.create({
      data: {
        messageId: message.id,
        sourceLang: 'en',
        targetLang: 'uz',
        status: 'pending',
      },
    });

    await this.prisma.translationOutbox.create({
      data: {
        translationId: translation.id,
        payload: {
          messageId: message.id,
          text: message.content,
          sourceLang: translation.sourceLang,
          targetLang: translation.targetLang,
        },
      },
    });

    this.messageGateway.server.emit('newMessage', message);

    return message;
  }

  async deleteMessage(messageId: string, user: any) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) throw new NotFoundException();

    if (user.role !== 'admin' && message.senderId !== user.id) {
      throw new ForbiddenException("Siz bu xabarni o‘chira olmaysiz");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });
  }

  async getMessages(conversationId: string, user: any) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });
    if (!conversation) throw new NotFoundException('Conversation topilmadi');

    if (user.role !== 'admin') {
      const isMember = conversation.members.some(m => m.userId === user.id);
      if (!isMember) throw new ForbiddenException('Siz bu conversation xabarlarini ko‘ra olmaysiz');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
