import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TransformResponseMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json;
    
    res.json = (data: any) => {
      const newData = {
        status: res.statusCode,
        message: '',
        data
      };
      return oldJson.call(res, newData);
    };

    next();
  }
}
