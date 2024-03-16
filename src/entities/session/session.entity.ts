import { Player } from "./player.entity";
import { SessionState } from "../schemas/session.enum";
import { ForbiddenException } from "@nestjs/common";
import { Card } from "./card.entity";
import {ChatGateway} from "../../chat/chat.gateway";

const finalScore: number = 10
const maxPlayers: number = 4
const minPlayers: number = 2
const countOfMemes: number = 30

interface PlayerDictionary {
  [key: string]: Player;
}

export class Session {
  // private static chatGateway: ChatGateway = new ChatGateway();

  readonly name: string;
  readonly owner: string;
  readonly players: PlayerDictionary = {}
  state: SessionState; 


  constructor(name: string, owner: Player) {
    this.name = name;


    this.owner = owner.username;
    // this.addPlayer(owner)

    this.state = SessionState.WAIT;
  }

  // addPlayer(player: Player): void {
  //   if (this.players.values.length >= Session.maxPlayers) {
  //     throw new ForbiddenException('Session is full');
  //   }
  //   this.players.set(player.username, player)
  // }

  // deletePlayer(username: string): void {
  //   delete this.players[username]
  // }

  startGame(): void {
    if (SessionState.START === this.state) {
      throw new ForbiddenException('Session is already started');
    } else if (Object.values(this.players).length < minPlayers) {
      throw new ForbiddenException('Not enough players');
    }

    // ChangeState()
    this.state = SessionState.START;
    // Session.chatGateway.startGameInRoom(this.name);
  }

  // vote(): void {
  //   if (SessionState.WAIT === this.state) {
  //     throw new ForbiddenException('Session is already voting');
  //   }
  //   this.state = SessionState.WAIT;
  //   Session.chatGateway.voteStart(this.name);
  // }

  // addPoint(player: Player): void {
  //   player.incrementScore();
  //   if (player.totalScore === Session.finalScore) {
  //     this.state = SessionState.FINISH;
  //     Session.chatGateway.endGame(this.name, player.username);
  //   }
  //   Session.chatGateway.voteEnded(this.name, player.username);
  //   this.cardsOnTable = [];
  // }

  // addCardsToPlayers(): void {
  //   this.players.forEach(player => {
  //     const cardId:number = Math.floor(Math.random() * Session.countOfMemes);
  //     player.addCard(cardId);
  //     Session.chatGateway.addCardToPlayer(player.username, cardId);
  //   })
  // }

  // addCardToDesk(cardID: number, username: string): void {
  //   const player = this.players.find(p => p.username === username);
  //   player.removeCard(cardID);
  //   this.cardsOnTable.push(new Card(cardID));
  //   Session.chatGateway.addCardToPlayer(this.name, cardID);
  // }

}