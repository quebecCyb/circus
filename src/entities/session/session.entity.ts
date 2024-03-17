import { Player } from "./player.entity";
import { SessionState } from "../schemas/session.enum";
import { ForbiddenException } from "@nestjs/common";
import { Card } from "./card.entity";
import {ChatGateway} from "../../chat/chat.gateway";

const finalScore = 10
const maxPlayers = 4
const minPlayers  = 2
const countOfMemes = 30

interface PlayerDictionary {
  [key: string]: Player;
}

export class Session {
  // private static chatGateway: ChatGateway = new ChatGateway();

  readonly name: string;
  readonly owner: string;
  readonly players: PlayerDictionary = {}
  state: SessionState;
  readonly usernameToScore: Map<string, number> = new Map();
  usernameToPointsInVote: Map<string, number> = new Map();

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
    // Session.chatGateway.startGameInRoom(this.name);
  }

  addVotePointToPlayer(username: string): void {
    if (this.usernameToPointsInVote.has(username)) {
      this.usernameToPointsInVote.set(username, this.usernameToPointsInVote.get(username) + 1);
    } else {
      this.usernameToPointsInVote.set(username, 1);
    }
  }

  getBestInVote(): string {
    let bestPlayer: string[];
    let maxPoints = 0;
    for (const [username, points] of this.usernameToPointsInVote) {
      if (points > maxPoints) {
        maxPoints = points;
        bestPlayer = [username];
      } else if (points === maxPoints) {
        bestPlayer.push(username);
      }
    }
    return bestPlayer.at(Math.floor(Math.random() * bestPlayer.length));
  }

  addScorePointToPlayer(username: string): void {
    if (this.usernameToScore.has(username)) {
      this.usernameToScore.set(username, this.usernameToScore.get(username) + 1);
      if (this.usernameToScore.get(username) === finalScore) {
        this.state = SessionState.FINISH;
      }
    } else {
      this.usernameToScore.set(username, 1);
    }
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