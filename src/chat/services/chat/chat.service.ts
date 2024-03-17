import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {
  private readonly usernameToSocket: Map<string, Socket> = new Map();
  private readonly socketidToUsername: Map<string, string> = new Map();

  connect(username: string, socketUser: Socket): void {
    this.usernameToSocket.set(username, socketUser);
    this.socketidToUsername.set(socketUser.id, username);
  }

  disconnect(socketUser: Socket): void {
    this.usernameToSocket.delete(this.socketidToUsername.get(socketUser.id));
    this.socketidToUsername.delete(socketUser.id);
  }

  getUsername(socket: Socket){
    return this.socketidToUsername.get(socket.id);
  }

  getSocket(username: string): Socket {
    if (!this.usernameToSocket.has(username)) {
      throw new ConflictException(`User with name ${username} is not connected`);
    }
    return this.usernameToSocket.get(username);
  }
}
