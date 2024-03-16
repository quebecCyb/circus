import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {
  private readonly nameToSocket: Map<string, Socket> = new Map();

  connect(name: string, socketUser: Socket): void {
    if (this.nameToSocket.has(name)) {
      throw new ConflictException(`User with name ${name} is already connected`);
    }
    this.nameToSocket.set(name, socketUser);
  }

  disconnect(name: string): void {
    if (!this.nameToSocket.has(name)) {
      throw new ConflictException(`User with name ${name} is not connected`);
    }
    this.nameToSocket.delete(name);
  }
}
