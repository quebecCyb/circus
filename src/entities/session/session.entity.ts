import { Player } from "./player.entity";
import { SessionStateEnum } from "../schemas/sessionState.enum";
import { ForbiddenException } from "@nestjs/common";

export class SessionService {
  private static readonly finalScore: number = 10;
  private readonly _uniqueName: number
  private readonly creator: Player
  private players: Player[]
  private state: SessionStateEnum
  private currPlayer: number

  constructor(uniqueName: number, creator: Player) {
    this._uniqueName = uniqueName;
    this.players = [];
    this.state = SessionStateEnum.WAITING;
    this.currPlayer = 0;
    this.creator = creator;
  }

  get uniqueName(): number {
    return this._uniqueName;
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= 4) {
      throw new ForbiddenException('Session is full');
    }
    this.players.push(player);
    return true;
  }

  startGame(): void {
    if (SessionStateEnum.STARTED === this.state) {
      throw new ForbiddenException('Session is already started');
    }
    this.state = SessionStateEnum.STARTED;
  }

  vote(): void {
    if (SessionStateEnum.WAITING === this.state) {
      throw new ForbiddenException('Session is already voting');
    }
    this.state = SessionStateEnum.WAITING;
  }

  nextPlayer(): string {
    this.currPlayer = (this.currPlayer + 1) % this.players.length;
    return this.players[this.currPlayer].login;
  }

  addPoint(player: Player): void {

  }
}