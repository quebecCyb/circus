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
  round: number = 0;
  readonly owner: string;
  readonly players: PlayerDictionary = {}

  readonly votes: Map<string, string> = new Map();



  state: SessionState;

  constructor(name: string, owner: Player) {
    this.round++;
    this.name = name;
    this.owner = owner.username;
    this.state = SessionState.WAIT;
  }


  discardVotes(): string {
    // Подсчет голосов для каждого игрока
    const voteCounts = new Map<string, number>();
    let maxVotes = 0;
    let winner: string | null = null;
  
    this.votes.forEach((value) => {
      const count = voteCounts.get(value) || 0;
      voteCounts.set(value, count + 1);
      
      if (count + 1 > maxVotes) {
        maxVotes = count + 1;
        winner = value;
      }
    });
  
    // Обнуляем votes map
    this.votes.clear();
  
    // Возвращаем имя победителя
    return winner || null;
  }

  vote(voterUsername: string, targetUsername: string): boolean {
    // Проверяем, что пользователь не голосует за себя и еще не голосовал
    if (voterUsername !== targetUsername && !this.votes.has(voterUsername)) {
      this.votes.set(voterUsername, targetUsername);
      return true;  // Голосование успешно
    }
    return false;  // Голосование не удалось
  }
}