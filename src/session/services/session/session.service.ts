import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from 'src/entities/session/player.entity';
import { Session } from 'src/entities/session/session.entity';
import { User } from 'src/entities/session/user.entity';
import { SessionCreateData } from 'src/session/schemas/session.create.dto';
import { SessionState } from "../../../entities/schemas/session.enum";
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from "../../../chat/services/chat/chat.service";
import { TopicPicker } from 'src/services/topicPicker';

type FindOption = {
    page?: number
}

const MAX_PLAYERS = 5;
const MAX_SCORE = 5;

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
    
    private chatGateway: ChatGateway;

    setGateway(gateway: ChatGateway) {
      this.chatGateway = gateway;
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
        console.log(username)
        const sessionName = this.playersToSession.get(username)
        console.log(sessionName)
        console.log(JSON.stringify(this.sessions))

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
            session.round++;
            Object.values(session.players).forEach( (e: Player) => {
                e.setCard(null);
            })
            let winner: string = session.discardVotes()

            // Игроки победили?
            if(Object.keys(session.players).includes(winner)){
                session.players[winner].incrementScore();
                if(session.players[winner].totalScore >= MAX_SCORE) // WIN
                {
                    this.notify(session.name, 'finish', {winner});
                    return
                }
            }
            this.notify(session.name, 'turn', {winner, topic: (new TopicPicker()).getRandomTopic()});
        }else if(state === SessionState.VOTE){
            // ...
            this.notify(session.name, 'vote', {});
        }else if(state === SessionState.DELAY){
            // ...
        }

        session.state = state

        // this.notify(session.name, state, state);
        this.iterateStates(session, NEXT_STATE[state], DELAY_STATE[state])
    }

    play(username, card){
        let sessionName: string = this.playersToSession.get(username);
        let session: Session = this.sessions.get(sessionName);
        session.players[username].setCard(card)
    }

    vote(username, target){
        let sessionName: string = this.playersToSession.get(username);
        let session: Session = this.sessions.get(sessionName);
        session.vote(username, target)
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
