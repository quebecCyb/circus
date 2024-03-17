import { User } from './user.entity';
import { Card } from "./card.entity";
export class Player extends User {
  totalScore: number
  card: string = null;

  constructor(user: User, totalScore: number = 0) {
    super(user.username, user.color);
    this.totalScore = totalScore;
  }

  incrementScore(): void {
    this.totalScore++;
  }

  setCard(card): void {
    this.card = card
  }
}