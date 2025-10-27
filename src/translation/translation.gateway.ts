// src/translation/translation.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface TranslationUpdatePayload {
  messageId: string;
  translatedText: string;
}

@WebSocketGateway({ cors: true })
export class TranslationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TranslationGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.warn(`Client disconnected: ${client.id}`);
  }

  sendTranslationUpdate(payload: TranslationUpdatePayload): void {
    this.logger.log(
      `Broadcasting translation for message: ${payload.messageId}`,
    );
    this.server.emit('translationUpdate', payload);
  }
}
