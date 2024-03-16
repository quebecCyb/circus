import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IRequest } from 'src/interfaces/IRequest';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UsersService
  ){}
  use(req: IRequest, res: Response, next: NextFunction) {
    console.log(req.session.username)
    if(req.session.username)
      req.user = this.userService.getUser(req.session.username);
    next();
  }
}

