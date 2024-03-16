import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { User } from 'src/entities/session/user.entity';
import { UserCreateData } from 'src/users/schemas/user.create.dto';


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

    createUser(userData: UserCreateData): User{
        const nickname = userData.username;
        
        if (this.users.has(nickname)) {
            throw new ForbiddenException('User already exists');
        }

        const newUser: User = new User(nickname, '#fff'); 
        this.users.set(nickname, newUser);

        return newUser;
    }

    isLoggedIn(user?: User){
        if(!user)
            throw new ForbiddenException('User Is Not Logged In')
        return user
    }

    getUser(username: string): User | null {
        console.log(this.users.has(username))
        if (this.users.has(username)) {
            return null
        }
        return this.users.get(username);
    }
}
