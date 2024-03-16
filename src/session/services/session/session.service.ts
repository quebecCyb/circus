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

        const newPlayer: Player = new Player(user)
        const newSession: Session = new Session(name, newPlayer); 
        this.sessions.set(name, newSession);

        this.addPlayer(newSession, newPlayer)

        return newSession;
    }

    delete(sessionName: string){
        let session: Session = this.sessions.get(sessionName);

        Object.values(session.players).forEach( (e: Player) => {
            delete this.playersToSession[e.username]
        })

        delete this.sessions[sessionName]
        
        // Notify players
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

    addPlayer(session: Session, player: Player): void {
        if (session.players.values.length >= MAX_PLAYERS) {
            throw new ForbiddenException('Session is full');
        }

        if(this.playersToSession.has(player.username)){
            let session: Session = this.sessions.get(this.playersToSession.get(player.username))
            this.deletePlayer(session, player.username)
        }

        session.players.set(player.username, player)
        this.playersToSession.set(player.username, session.name)
    }

    deletePlayer(session: Session, username: string): void {
        delete session.players[username]
        if(session.owner === username) {

        }

    }
}
