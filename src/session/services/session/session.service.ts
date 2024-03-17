import { ForbiddenException, Injectable } from '@nestjs/common';
import { Player } from 'src/entities/session/player.entity';
import { Session } from 'src/entities/session/session.entity';
import { User } from 'src/entities/session/user.entity';
import { SessionCreateData } from 'src/session/schemas/session.create.dto';

type FindOption = {
    page?: number
}

const MAX_PLAYERS = 5;

@Injectable()
export class SessionService {

    private readonly sessions: Map<string, Session> = new Map()
    private readonly playersToSession: Map<string, string> = new Map()

    constructor(){
        
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
        let session: Session = this.sessions.get(sessionName);

        Object.values(session.players).forEach( (e: Player) => {
            this.playersToSession.delete(e.username)
        })

        this.sessions.delete(sessionName)

        // Notify players

    }

    getSessionByPlayer(username: string){
        let sessionName = this.playersToSession.get(username)
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
        let session = this.sessions.get(sessionName)
        if (Object.keys(session.players).length >= MAX_PLAYERS) {
            throw new ForbiddenException('Session is full');
        }

        if(this.playersToSession.has(player.username)){
            console.log('Player username delete: ' + player.username)
            let session: Session = this.sessions.get(this.playersToSession.get(player.username))
            this.deletePlayer(session.name, player.username)
        }

        session.players[player.username] = player
        this.playersToSession.set(player.username, session.name)

    }

    deletePlayer(sessionName: string, username: string): void {
        let session: Session = this.sessions.get(sessionName)

        if(session.owner === username) {
            this.delete(session.name)
        }

        delete session.players[username]
    }
}
