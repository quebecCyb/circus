import { Body, Controller, Get, Post, Req } from '@nestjs/common';
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
}
