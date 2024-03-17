import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {
  private usernameToSocket: Map<string, Socket>;
  private socketIdToUsername: Map<string, string>;

  constructor() {
    this.usernameToSocket = new Map();
    this.socketIdToUsername = new Map();
  }

  connect(username: string, socketUser: Socket): void {
    console.log(`Connecting: ${username} with socket ID ${socketUser.id}`);
    this.usernameToSocket.set(username, socketUser);
    this.socketIdToUsername.set(socketUser.id, username);

    this.logUsers();
  }

  disconnect(socketUser: Socket): void {
    const username = this.socketIdToUsername.get(socketUser.id);
    if (username) {
      console.log(`Disconnecting: ${username}`);
      // this.usernameToSocket.delete(username);
      // this.socketIdToUsername.delete(socketUser.id);
    }

    this.logUsers();
  }

  logUsers() {
    console.log(`Current users: ${Array.from(this.socketIdToUsername.values())}`);
  }

  getUsername(socket: Socket): string {
    this.logUsers();
    return this.socketIdToUsername.get(socket.id);
  }

  getSocket(username: string): Socket {
    if (!this.usernameToSocket.has(username)) {
      throw new ConflictException(`User with name ${username} is not connected`);
    }
    return this.usernameToSocket.get(username);
  }
}
