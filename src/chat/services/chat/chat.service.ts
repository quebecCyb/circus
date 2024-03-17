import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {
  private readonly usernameToSocket: Map<string, Socket> = new Map();
  private readonly socketIdToUsername: Map<string, string> = new Map();

  connect(username: string, socketUser: Socket): void {
    this.usernameToSocket.set(username, socketUser);
    this.socketIdToUsername.set(socketUser.id, username);
  }

  disconnect(socketUser: Socket): void {
    this.usernameToSocket.delete(this.socketIdToUsername.get(socketUser.id));
    this.socketIdToUsername.delete(socketUser.id);
  }

  getUsername(socket: Socket){
    console.log(socket)
    return this.socketIdToUsername.get(socket.id);
  }

  getSocket(username: string): Socket {
    if (!this.usernameToSocket.has(username)) {
      throw new ConflictException(`User with name ${username} is not connected`);
    }
    return this.usernameToSocket.get(username);
  }

}
