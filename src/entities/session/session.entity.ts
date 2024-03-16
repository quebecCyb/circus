import { Player } from "./player.entity";
import { SessionState } from "../schemas/session.enum";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Card } from "./card.entity";
import {ChatGateway} from "../../chat/chat.gateway";

@Injectable()
export class Session {
  private static chatGateway: ChatGateway = new ChatGateway();
  private static readonly finalScore: number = 10
  private static readonly maxPlayers: number = 4
  private readonly _name: string
  private readonly creator: Player
  private players: Player[]
  private state: SessionState
  private currPlayer: number
  private cardsOnTable: Card[]

  constructor(name: string, creator: Player) {
    this._name = name;
    this.players = [];
    this.state = SessionState.WAIT;
    this.currPlayer = 0;
    this.creator = creator;
  }

  get name(): string {
    return this._name;
  }

  addPlayer(player: Player): void {
    if (this.players.length >= Session.maxPlayers) {
      throw new ForbiddenException('Session is full');
    }
    this.players.push(player);
  }

  startGame(): void {
    if (SessionState.START === this.state) {
      throw new ForbiddenException('Session is already started');
    }
    this.state = SessionState.START;
    Session.chatGateway.startGameInRoom(this.name);
  }

  vote(): void {
    if (SessionState.WAIT === this.state) {
      throw new ForbiddenException('Session is already voting');
    }
    this.state = SessionState.WAIT;
    Session.chatGateway.voteStart(this.name);
  }

  addPoint(player: Player): void {
    player.incrementScore();
    if (player.totalScore === Session.finalScore) {
      this.state = SessionState.FINISH;
      Session.chatGateway.endGame(this.name, player.username);
    }
    Session.chatGateway.voteEnded(this.name, player.username);
    this.cardsOnTable = [];
  }

  addCard(player: Player, card: Card): void {
    player.removeCard(card);
    this.cardsOnTable.push(card);
    Session.chatGateway.addCardToDesk(this.name, card.id);
  }
}