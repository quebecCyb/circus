import { Injectable } from '@nestjs/common';
import { Session } from 'src/entities/session/session.entity';

@Injectable()
export class SessionService {

    private readonly sessions: Map<string, Session>

    constructor(){

    }
}
