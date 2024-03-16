import { Body, Controller, ForbiddenException, Get, Post, Req } from '@nestjs/common';
import { IRequest } from 'src/interfaces/IRequest';
import { User } from 'src/schemas/User';
import { UserCreateDto } from 'src/users/schemas/user.create.data';
import { UsersService } from 'src/users/services/users/users.service';

@Controller('user')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
    ){}
    
    @Post()
    addUser(@Req() req: IRequest, @Body() body: UserCreateDto){
        let user: User = this.userService.createUser(body);
        req.session.username = user.username
        return user;
    }
    
    @Get('logged')
    logged(@Req() req: IRequest){
        return this.userService.isLoggedIn(req.user)
    }
}
