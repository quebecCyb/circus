import { Module } from '@nestjs/common';
import { SessionController } from './controllers/session/session.controller';
import { SessionService } from './services/session/session.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
