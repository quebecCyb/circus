import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as blackList from "src/config/firewall/black_listed_ip.json"
import { getIP } from 'src/services/Ip';
import { IRequest } from 'src/interfaces/IRequest';

@Injectable()
export class FirewallMiddleware implements NestMiddleware {
  use(req: IRequest, res: Response, next: NextFunction) {
    if(blackList.includes(getIP(req)))
        throw new ForbiddenException('IP blocked');
    next();
  }
}

