
import { Request } from 'express'
import { User } from 'src/schemas/User';

export interface IRequest extends Request{
    lang?: string;
    session: any;

    user: User;
}

