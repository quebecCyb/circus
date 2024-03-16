import { HttpException, HttpStatus, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from "crypto";
import { UserCreateData } from 'src/users/schemas/user.create.dto';

import * as jwt from 'jsonwebtoken';
import { UserToken } from 'src/users/schemas/user.token';

@Injectable()
export class UsersService {
    constructor(
    ){}

    hashPassword(password: string){
        const hmac = crypto.createHmac('sha256', process.env.PASSWORD_KEY);
        hmac.update(password);
      
        const result = hmac.digest('hex');
        return result;
    }

    createToken(user: User): string{
        throw new NotImplementedException();
    }

    async verifyToken(token: string): Promise<UserToken>{
        return new Promise( (res, rej) => {
                jwt.verify(token, process.env.JWT_KEY, (error, decodedToken: UserToken) => {
                    if (error) {
                        // Token verification failed
                        console.error('Token verification failed:', error.message);
                        return rej(new HttpException('You Are Not Logged In', HttpStatus.FORBIDDEN))
                    } 
                    return res(decodedToken)
                })
            }
        )
    }

    async createUser(userData: UserCreateData): Promise<string>{
        throw new NotImplementedException();
    }

    async isLoggedIn(token: string){
        throw new NotImplementedException();
    }

    async getUser(token: string): Promise<User>{
        throw new NotImplementedException();
    }

    save(user: User){
        throw new NotImplementedException();
    }
}
