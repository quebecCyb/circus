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
  private readonly _uniqueName: string
  private readonly creator: Player
  private players: Player[]
  private state: SessionState
  private currPlayer: number
  private cardsOnTable: Card[]

  constructor(uniqueName: string, creator: Player) {
    this._uniqueName = uniqueName;
    this.players = [];
    this.state = SessionState.WAIT;
    this.currPlayer = 0;
    this.creator = creator;
  }

  get uniqueName(): string {
    return this._uniqueName;
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
    Session.chatGateway.startGameInRoom(this._uniqueName);
  }

  vote(): void {
    if (SessionState.WAIT === this.state) {
      throw new ForbiddenException('Session is already voting');
    }
    this.state = SessionState.WAIT;
    Session.chatGateway.voteStart(this._uniqueName);
  }

  addPoint(player: Player): void {
    player.incrementScore();
    if (player.totalScore === Session.finalScore) {
      this.state = SessionState.FINISH;
      Session.chatGateway.endGame(this._uniqueName, player.username);
    }
    Session.chatGateway.voteEnded(this._uniqueName, player.username);
    this.cardsOnTable = [];
  }

  addCard(player: Player, card: Card): void {
    player.removeCard(card);
    this.cardsOnTable.push(card);
    Session.chatGateway.addCardToDesk(this._uniqueName, card.id);
  }
}