import { User } from './user.entity';
import { Card } from "./card.entity";
export class Player extends User {
  private _totalScore: number
  private _cards: Card[]

  constructor(user: User, totalScore: number) {
    super(user.username, user.color);
    this._totalScore = totalScore;
  }

  get totalScore(): number {
    return this._totalScore;
  }

  incrementScore(): void {
    this._totalScore++;
  }

  addCard(card: Card): void {
    this._cards.push(card);
  }

  removeCard(card: Card): void {
    this._cards = this._cards.filter(c => c.id !== card.id);
  }
}