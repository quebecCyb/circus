import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { User } from 'src/entities/session/user.entity';
import { UserCreateData } from 'src/users/schemas/user.create.dto';
import * as jwt from 'jsonwebtoken';
import { UserToken } from 'src/users/schemas/user.token';
import { ColorPicker } from 'src/services/colorPicker';


@Injectable()
export class UsersService {
    private readonly users: Map<string, User> = new Map();
    
    constructor(
    ){}

    // hashPassword(password: string){
    //     const hmac = crypto.createHmac('sha256', process.env.PASSWORD_KEY);
    //     hmac.update(password);
    //     const result = hmac.digest('hex');
    //     return result;
    // }

    generateToken(payload: UserToken, secret=process.env.SECRET, options= { expiresIn: '1d' }){
        // Асинхронная функция для создания токена
        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
            });
        });
    }

    verifyToken(token: string, secret=process.env.SECRET, options= { expiresIn: '1d' }): Promise<UserToken | null> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, options, (err, decoded: UserToken) => {
                if (err || !this.users.has(decoded.username)) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
  

    createUser(userData: UserCreateData): User{
        const nickname = userData.username;
        
        if (this.users.has(nickname)) {
            throw new ForbiddenException('User already exists');
        }

        const newUser: User = new User(nickname, (new ColorPicker()).getRandomColor()); 
        this.users.set(nickname, newUser);

        return newUser;
    }

    isLoggedIn(user?: User){
        if(!user)
            throw new ForbiddenException('User Is Not Logged In')
        return user
    }

    getUser(username: string): User | null {
        if (!this.users.has(username)) {
            return null
        }
        return this.users.get(username);
    }
}
