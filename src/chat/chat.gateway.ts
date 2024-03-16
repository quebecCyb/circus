import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id} in rooms ${client.rooms}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id} in rooms ${client.rooms}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.emit('leftRoom', room);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, { room, message }: { room: string; message: string }): void {
    this.server.to(room).emit('receiveMessage', message);
  }

  startGameInRoom(room: string): void {
    this.server.to(room).emit('gameStarted', true);
  }

  voteStart(room: string): void {
    this.server.to(room).emit('voting', true);
  }

  voteEnded(room: string, winnerOfVote: string): void {
    this.server.to(room).emit('voting', winnerOfVote);
  }

  deskErase(room: string): void {
    this.server.to(room).emit('eraseDesk', true);
  }

  addCardToDesk(room: string, card: number): void {
    this.server.to(room).emit('addCardToDesk', card);
  }

  endGame(room: string, winner: string): void {
    this.server.to(room).emit('gameEnded', winner);
  }
}
