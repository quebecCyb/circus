import { User } from './user.entity';
export class Player extends User {
  private _totalScore: number

  constructor(user: User, totalScore: number) {
    super(user.login, user.color);
    this._totalScore = totalScore;
  }

  get totalScore(): number {
    return this._totalScore;
  }
}