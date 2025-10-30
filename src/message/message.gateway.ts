import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.activeUsers.set(userId, client.id);
    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) this.activeUsers.delete(userId);
    }
    console.log(`User disconnected`);
  }

  sendMessageToConversation(
    conversationId: string,
    message: any,
    members: any[],
  ) {
    for (const member of members) {
      const socketId = this.activeUsers.get(member.userId);
      if (socketId) {
        this.server
          .to(socketId)
          .emit('new_message', { conversationId, message });
      }
    }
  }
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { content: string; conversationId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.broadcast.emit('receiveMessage', data);
  }
}
