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
    this.state = SessionState.WAIT;
  }

}