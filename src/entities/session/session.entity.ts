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
  private static readonly minPlayers: number = 2
  private static readonly countOfMemes: number = 20
  private readonly _name: string
  owner: string
  private players: Player[]
  private state: SessionState
  private cardsOnTable: Card[]

  constructor(name: string, owner: string) {
    this._name = name;
    this.players = [];
    this.state = SessionState.WAIT;
    this.owner = owner;
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

  deletePlayer(player: string): void {
    this.players = this.players.filter(p => p.username !== player);
  }

  startGame(): void {
    if (SessionState.START === this.state) {
      throw new ForbiddenException('Session is already started');
    } else if (this.players.length < Session.minPlayers) {
      throw new ForbiddenException('Not enough players');
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

  addCardsToPlayers(): void {
    this.players.forEach(player => {
      const cardId:number = Math.floor(Math.random() * Session.countOfMemes);
      player.addCard(cardId);
      Session.chatGateway.addCardToPlayer(player.username, cardId);
    })
  }

  addCardToDesk(cardID: number, username: string): void {
    const player = this.players.find(p => p.username === username);
    player.removeCard(cardID);
    this.cardsOnTable.push(new Card(cardID));
    Session.chatGateway.addCardToPlayer(this.name, cardID);
  }

}