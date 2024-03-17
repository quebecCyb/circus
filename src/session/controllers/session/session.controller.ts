import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { IRequest } from 'src/interfaces/IRequest';
import { SessionCreateDto } from 'src/session/schemas/session.create.data';
import { SessionService } from 'src/session/services/session/session.service';

@Controller('session')
export class SessionController {

    constructor(
        private readonly sessionService: SessionService
    ){}

    @Post()
    addSession(@Req() req: IRequest, @Body() body: SessionCreateDto){
        return this.sessionService.create(body, req.user)
    }


    @Get()
    getSessions(){
        return this.sessionService.get({});
    }

    @Get(':name')
    getSession(@Param('name') name: string){
        return this.sessionService.getSessionByName(name);
    }

    @Post(':name')
    joinSession(@Req() req: IRequest, @Param('name') name: string){
        let player = this.sessionService.createPlayer(req.user)
        return this.sessionService.addPlayer(name, player);
    }
}
