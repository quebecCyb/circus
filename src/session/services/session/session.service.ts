import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from 'src/entities/session/player.entity';
import { Session } from 'src/entities/session/session.entity';
import { User } from 'src/entities/session/user.entity';
import { SessionCreateData } from 'src/session/schemas/session.create.dto';
import { SessionState } from "../../../entities/schemas/session.enum";
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from "../../../chat/services/chat/chat.service";

type FindOption = {
    page?: number
}

const MAX_PLAYERS = 5;
const VOTE_TIME = 15000;
const TURN_TIME = 10000;
const DELAY_TIME = 5000;


let DELAY = {

}

const NEXT_STATE = {
    [SessionState.VOTE]: SessionState.TURN,
    [SessionState.TURN]: SessionState.VOTE,
}

const DELAY_STATE = {
    [SessionState.VOTE]: 5000,
    [SessionState.TURN]: 10000,
}

@Injectable()
export class SessionService {

    private readonly sessions: Map<string, Session> = new Map()
    private readonly playersToSession: Map<string, string> = new Map()

    constructor(
      private chatService: ChatService,
      private chatGateway: ChatGateway
    ){
        
    }

    create(sessionData: SessionCreateData, user: User){
        const name = sessionData.name;
        
        if (!user) {
            throw new ForbiddenException('You are not logged in');
        }

        if (this.sessions.has(name)) {
            throw new ForbiddenException('Session Name already exists');
        }

        const newPlayer: Player = this.createPlayer(user)
        const newSession: Session = new Session(name, newPlayer); 
        this.sessions.set(name, newSession);

        this.addPlayer(name, newPlayer)

        return newSession;
    }

    createPlayer(user: User){
        return new Player(user)
    }

    delete(sessionName: string){
        const session: Session = this.sessions.get(sessionName);

        Object.values(session.players).forEach( (e: Player) => {
            this.playersToSession.delete(e.username)
        })

        this.sessions.delete(sessionName)

        // Notify players

    }

    getSessionByPlayer(username: string){
        const sessionName = this.playersToSession.get(username)
        if(!Object.keys(this.sessions.get(sessionName).players).includes(username))
            throw new ForbiddenException('Player is not allowed to connect to this room!');
        return sessionName
    }

    get({page = 0}: FindOption){
        return Array.from(this.sessions.values()).slice(0, 10);
    }

    getSessionByName(name: string): Session {
        if (!this.sessions.has(name)) {
            throw new ForbiddenException('Session does not exist');
        }
        return this.sessions.get(name);
    }

    addPlayer(sessionName: string, player: Player): void {
        const session = this.sessions.get(sessionName)
        if(!session)
            throw new NotFoundException('Session is not found!')
        if (Object.keys(session.players).length >= MAX_PLAYERS) {
            throw new ForbiddenException('Session is full');
        }

        if(this.playersToSession.has(player.username)){
            console.log('Player username delete: ' + player.username)
            const session: Session = this.sessions.get(this.playersToSession.get(player.username))
            this.deletePlayer(session.name, player.username)
        }

        session.players[player.username] = player
        this.playersToSession.set(player.username, session.name)

    }

    deletePlayer(sessionName: string, username: string): void {
        const session: Session = this.sessions.get(sessionName)

        if(session.owner === username) {
            this.delete(session.name)
        }

        delete session.players[username]
    }

    notify(sessionName: string, emit: string, data?: any): void {
        this.chatGateway.notify(sessionName, emit, data)
    }

    changeState(session: Session, state: SessionState){
        if(state === SessionState.TURN){
            // Игроки победили?
            if(false)// WIN
            {
                return
            }

            // Игроки тянут карты
            // Object.values(session.players).forEach((player: Player) => {
            //     player
            // });
        }else if(state === SessionState.VOTE){
            // ...
        }else if(state === SessionState.DELAY){
            // ...
        }

        session.state = state

        this.notify(session.name, 'state', state);
        this.iterateStates(session, NEXT_STATE[state], DELAY_STATE[state])
    }

    start(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notify(session.name, 'started');
        this.changeState(session, SessionState.TURN)
    }

    finish(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notify(session.name, 'finished');
    }

    private iterateStates(session: Session, currState: SessionState ,seconds: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.changeState(session, currState);
                resolve();
            }, seconds);
        })
    }
}
