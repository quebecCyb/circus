import { Player } from "./player.entity";
import { SessionState } from "../schemas/session.enum";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Card } from "./card.entity";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';

const MAX_PLAYERS = 5;

@Injectable()
export class Session {
  private readonly _name: string
  private readonly owner: string


  private players: string[]
  private state: SessionState
  private cardsOnTable: Card[]

  constructor(name: string, owner: string) {
    this._name = name;
    this.players = [owner];
    this.state = SessionState.WAIT;
    this.owner = owner;
  }

  get name(): number {
    return this.name;
  }

  addPlayer(player: string): boolean {
    if (this.players.length >= MAX_PLAYERS) {
      throw new ForbiddenException('Session is full');
    }
    this.players.push(player);
    return true;
  }

  startGame(): void {
    if (SessionState.START === this.state) {
      throw new ForbiddenException('Session is already started');
    }
    this.state = SessionState.START;
  }

  changeState(newState: SessionState): void {
    if (SessionState.WAIT === this.state) {
      throw new ForbiddenException('Session is already voting');
    }
    this.state = SessionState.WAIT;
  }

  // addPoint(player: Player): void {
  //   player.incrementScore();
  //   if (player.totalScore === SessionService.finalScore) {
  //     this.state = SessionStateEnum.FINISHED;
  //     // TODO: send message to all players
  //   }
  // }

  // playCard(player: Player, card: Card): void {
  //   player.removeCard(card);
  //   this.cardsOnTable.push(card);
  //   // this.server.adapter().rooms.
  // }


}