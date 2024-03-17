import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
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
    async addUser(@Req() req: IRequest, @Res({passthrough: true}) res: Response, @Body() body: UserCreateDto){
        const user: User = this.userService.createUser(body);
        return {user, token: await this.userService.generateToken({username: user.username})};
    }
    
    @Get('logged')
    logged(@Req() req: IRequest){
        return this.userService.isLoggedIn(req.user)
    }
}
