import { Body, Controller, ForbiddenException, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/entities/session/user.entity';
import { IRequest } from 'src/interfaces/IRequest';
import { UserCreateDto } from 'src/users/schemas/user.create.data';
import { UsersService } from 'src/users/services/users/users.service';

@Controller('user')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
    ){}
    
    @Post()
    addUser(@Req() req: IRequest, @Res({passthrough: true}) res: Response, @Body() body: UserCreateDto){
        let user: User = this.userService.createUser(body);
        req.session.username = user.username
        res.cookie('username', user.username, { httpOnly: true });
        return user;
    }
    
    @Get('logged')
    logged(@Req() req: IRequest){
        return this.userService.isLoggedIn(req.user)
    }
}
