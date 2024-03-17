import { ForbiddenException, Injectable } from '@nestjs/common';
import { Player } from 'src/entities/session/player.entity';
import { Session } from 'src/entities/session/session.entity';
import { User } from 'src/entities/session/user.entity';
import { SessionCreateData } from 'src/session/schemas/session.create.dto';
import { SessionState } from "../../../entities/schemas/session.enum";

type FindOption = {
    page?: number
}

const MAX_PLAYERS = 5;
const VOTE_TIME = 15000;
const TURN_TIME = 10000;
const DELAY_TIME = 5000;

@Injectable()
export class SessionService {

    private readonly sessions: Map<string, Session> = new Map()
    private readonly playersToSession: Map<string, string> = new Map()

    constructor(
      private chatService: ChatService
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

    private notifyPlayers(session: Session, emit: string, data?: string): void {
        Object.values(session.players).forEach( (player: Player) => {
            const socket = this.chatService.getSocket(player.username);
            socket.emit(emit, (data! ? true : data));
        })
    }

    startGame(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notifyPlayers(session, 'gameStarted');
        session.startGame();
    }

    delayGame(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notifyPlayers(session, 'delayGame');
    }

    voteStart(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notifyPlayers(session, 'voting');
    }

    voteEnded(sessionName: string, winnerOfVote: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notifyPlayers(session, 'voteEnded', winnerOfVote);
    }

    gameEnded(sessionName: string): void {
        const session: Session = this.sessions.get(sessionName)
        this.notifyPlayers(session, 'gameEnded', "winner");
        // TODO: Add winner logic
    }

    async setNextGameState(sessionName: string): Promise<void> {
        const currState: SessionState = this.sessions.get(sessionName).state;
        if (currState === SessionState.START) {
            this.sessions.get(sessionName).state = SessionState.DELAY;
            this.startGame(sessionName);
            await this.setNextGameState(currState);
        } else if (currState === SessionState.TURN) {
            this.sessions.get(sessionName).state = SessionState.VOTE;
            this.voteStart(sessionName);
            await this.iterateStates(currState, VOTE_TIME);
        } else if (currState === SessionState.VOTE) {
            this.sessions.get(sessionName).state = SessionState.DELAY;
            this.voteEnded(sessionName, "winner");
            // TODO: Add winner logic
            await this.iterateStates(currState, TURN_TIME);
        } else if (currState === SessionState.DELAY) {
            this.sessions.get(sessionName).state = SessionState.TURN;
            // TODO: Add giving of card logic
            await this.iterateStates(currState, DELAY_TIME);
        } else if (currState === SessionState.FINISH) {
            return new Promise((resolve): void => {
                this.gameEnded(sessionName);
                resolve();
            });
        }
    }

    private iterateStates(currState: SessionState ,seconds: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.setNextGameState(currState);
                console.log(currState)
                resolve();
            }, seconds);
        })
    }
}
