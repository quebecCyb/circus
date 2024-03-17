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
import { CLIENT_ROUTE, SERVER_ROUTE } from 'src/entities/schemas/socket.routes';

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
      if(!userToken)
        throw new ForbiddenException('User Token');
      console.log(`Client connected: ${client.id} | ${userToken.username} `);
      this.chatService.connect(userToken.username, client)

    }catch(e){
      console.error(e)
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id} in rooms ${this.chatService.getUsername(client)}`);
    // this.chatService.disconnect(client)
  }

  @SubscribeMessage(CLIENT_ROUTE.JOIN)
  async handleJoinRoom(client: Socket,  data: {session: string}) {
    let username: string = this.chatService.getUsername(client)
    console.log('Join room:' + username)

    if(this.sessionService.getSessionByPlayer(username) !== data.session){
      throw new ForbiddenException('You are not allowed to join this room (incorrect session name)')
    }

    this.notify(data.session, SERVER_ROUTE.JOIN, username)
  }


  @SubscribeMessage(CLIENT_ROUTE.LEFT)
  handleLeaveRoom(client: Socket): void {
    const username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    client.leave(session);

    this.notify(session, SERVER_ROUTE.LEFT, {username})
    this.sessionService.deletePlayer(session, username)
  }

  @SubscribeMessage(CLIENT_ROUTE.START)
  async handleStartGame(client: Socket) {
    console.log('START')
    let username: string = this.chatService.getUsername(client)
    let sessionName: string = this.sessionService.getSessionByPlayer(username)

    let session: Session = this.sessionService.getSessionByName(sessionName);
    if(session.owner !== username){
      throw new ForbiddenException('You are not allowed to start the game')
    }else if(Object.values(session.players).length < 2){
      throw new ForbiddenException('Not enough players')
    }
    console.log('STARTED')

    this.notify(session.name, SERVER_ROUTE.STARTED, {})
    this.sessionService.start(sessionName);

  }

  @SubscribeMessage(CLIENT_ROUTE.VOTE)
  vote(client: Socket, { target }: { target: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    // VOTE ACTION
    this.sessionService.vote(username, target);
    
    // this.server.to(session).emit(, {target});
    this.notify(session, 'voted', {target})

  }

  @SubscribeMessage(CLIENT_ROUTE.PLAY)
  play(client: Socket, { card }: { card: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    // PLAY ACTION
    this.sessionService.play(username, card);

    this.notify(session, 'played', {username, card})
  }

  notify(sessionName: string, emit: string, data: any) {
    console.log('Sent: ' + sessionName + ' - ' + emit)
    let session: Session = this.sessionService.getSessionByName(sessionName)
    Object.keys(session.players).forEach(player => {
      let socket = this.chatService.getSocket(player);
      this.server.to(socket.id).emit(emit, data)
    });
    // this.server.to(session).emit(emit, data);
  }


  @SubscribeMessage(CLIENT_ROUTE.MSG)
  handleMessage(client: Socket, { message }: { message: string }): void {
    let username: string = this.chatService.getUsername(client)
    let session: string = this.sessionService.getSessionByPlayer(username);

    this.notify(session, SERVER_ROUTE.MSG, {username, message})

  }
}
