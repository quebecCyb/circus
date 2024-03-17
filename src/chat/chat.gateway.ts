import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { SessionService } from "../session/services/session/session.service";
import { ChatService } from './services/chat/chat.service';
import { JoinDto } from './schemas/join.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UserToken } from 'src/users/schemas/user.token';

@Injectable()
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  clients: string[];

  @WebSocketServer()
  server: Server;
  

  constructor(
    private sessionService: SessionService,
    private userService: UsersService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try{
      const token = client.handshake.query.token;
      let userToken: UserToken = await this.userService.verifyToken(token.toString());
      console.log(`Client connected: ${client.id} | ${userToken.username} `);
      this.chatService.connect(userToken.username, client)
    }catch(e){
      console.error(e)
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id} in rooms ${client.rooms}`);
    this.chatService.disconnect(client)
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket,  data: {session: string}) {
    let username: string = this.chatService.getUsername(client)
    if(this.sessionService.getSessionByPlayer(username) !== data.session){
      throw new ForbiddenException('You are not allowed to join this room (incorrect session name)')
    }

    client.join(data.session);
    this.server.to(data.session).emit('joined', username);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, data: {session: string}): void {
    let username: string = this.chatService.getUsername(client)
    client.leave(data.session);
    this.server.to(data.session).emit('left', {username});
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, { session, message }: { session: string; message: string }): void {
    let username: string = this.chatService.getUsername(client)

    this.server.to(session).emit('receiveMessage', {username, message});
  }

  sendNotificationToRoom(room: string, message: string) {
    this.server.to(room).emit('notification', message);
  }

  startGameInRoom(room: string): void {
    this.server.to(room).emit('gameSta', true);
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

  addCardToPlayer(player: string, card: number): void {
    this.server.to(player).emit('addCard', card);
  }

  @SubscribeMessage('addCardToDesk')
  addCardToDesk(client: Socket, { room, card, username }: {room: string,
    card: number, username: string}): void {
    this.server.to(room).emit('addCardToDesk', card);
    this.sessionService.getSessionByName(room) // .addCardToDesk(card, username);
  }

  endGame(room: string, winner: string): void {
    this.server.to(room).emit('gameEnded', winner);
  }
}
