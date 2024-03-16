import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {
  private readonly usernameToSocket: Map<string, Socket> = new Map();

  connect(username: string, socketUser: Socket): void {
    if (this.usernameToSocket.has(username)) {
      throw new ConflictException(`User with name ${username} is already connected`);
    }
    this.usernameToSocket.set(username, socketUser);
  }

  disconnect(username: string): void {
    if (!this.usernameToSocket.has(username)) {
      throw new ConflictException(`User with name ${username} is not connected`);
    }
    this.usernameToSocket.delete(username);
  }

}
