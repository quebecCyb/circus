
import { Request } from 'express'
import { User } from 'src/entities/session/user.entity';

export interface IRequest extends Request{
    lang?: string;
    session: any;

    user: User;
}

