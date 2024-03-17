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
import { Session } from 'src/entities/session/session.entity';

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
      if(!token){
        throw new ForbiddenException('U are not logged in!')
      }
      const userToken: UserToken = await this.userService.verifyToken(token.toString());
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

  @SubscribeMessage(CLIENT_ROUTE.JOIN)
  async handleJoinRoom(client: Socket,  data: {session: string}) {
    let username: string = this.chatService.getUsername(client)
    if(this.sessionService.getSessionByPlayer(username) !== data.session){
      throw new ForbiddenException('You are not allowed to join this room (incorrect session name)')
    }

    client.join(data.session);
    this.server.to(data.session).emit(SERVER_ROUTE.JOIN, username);
  }


  @SubscribeMessage(CLIENT_ROUTE.LEFT)
  handleLeaveRoom(client: Socket): void {
    const username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    client.leave(session);
    this.server.to(session).emit(SERVER_ROUTE.LEFT, {username});
    this.sessionService.deletePlayer(session, username)
  }

  @SubscribeMessage(CLIENT_ROUTE.START)
  async handleStartGame(client: Socket) {
    let username: string = this.chatService.getUsername(client)
    let sessionName: string = this.sessionService.getSessionByPlayer(username)

    let session: Session = this.sessionService.getSessionByName(sessionName);
    if(session.owner !== username){
      throw new ForbiddenException('You are not allowed to start the game')
    }else if(Object.values(session.players).length < 2){
      throw new ForbiddenException('Not enough players')
    }

    this.sessionService.start(sessionName);
    this.server.to(session.name).emit(SERVER_ROUTE.STARTED);
  }

  @SubscribeMessage(CLIENT_ROUTE.VOTE)
  vote(client: Socket, { target }: { target: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    // VOTE ACTION
    this.sessionService.vote(username, target);
    
    this.server.to(session).emit('voted', {target});
  }

  @SubscribeMessage(CLIENT_ROUTE.PLAY)
  play(client: Socket, { card }: { card: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    // PLAY ACTION
    this.sessionService.play(username, card);

    this.server.to(session).emit('played', {username, card});
  }

  notify(session: string, emit: string, data: any) {
    this.server.to(session).emit(emit, data);
  }


  @SubscribeMessage(CLIENT_ROUTE.MSG)
  handleMessage(client: Socket, { message }: { message: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    this.server.to(session).emit(SERVER_ROUTE.MSG, {username, message});
  }
}
