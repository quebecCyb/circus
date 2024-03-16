import { ForbiddenException, Injectable } from '@nestjs/common';
import { Session } from 'src/entities/session/session.entity';
import { User } from 'src/entities/session/user.entity';
import { SessionCreateData } from 'src/session/schemas/session.create.dto';

type FindOption = {
    page?: number
}

@Injectable()
export class SessionService {

    private readonly sessions: Map<string, Session>

    constructor(){}

    create(sessionData: SessionCreateData, user: User){
        const name = sessionData.name;
        
        if (!user) {
            throw new ForbiddenException('You are not logged in');
        }

        if (this.sessions.has(name)) {
            throw new ForbiddenException('Session Name already exists');
        }

        const newSession: Session = new Session(name, user.username); 
        this.sessions.set(name, newSession);

        return newSession;
    }

    get({page = 0}: FindOption){
        return Array.from(this.sessions.values()).slice(0, 10);
    }

    getRoomByName(name: string): Session {
        if (!this.sessions.has(name)) {
            throw new ForbiddenException('Session does not exist');
        }
        return this.sessions.get(name);
    }
}
