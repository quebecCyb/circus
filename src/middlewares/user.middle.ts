import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IRequest } from 'src/interfaces/IRequest';
import { UserToken } from 'src/users/schemas/user.token';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UsersService
  ){}
  async use(req: IRequest, res: Response, next: NextFunction) {
    console.log(req.cookies)
    if(req.cookies && req.cookies['token']){
      let token = req.cookies['token'];
      let user: UserToken | null = await this.userService.verifyToken(token)
      req.user = this.userService.getUser(user.username);
    }
    next();
  }
}

