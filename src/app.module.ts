import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FirewallMiddleware } from './middlewares/firewall.middle';
import { UserMiddleware } from './middlewares/user.middle';
import { UsersModule } from './users/users.module';
import { ChatGateway } from './chat/chat.gateway';
import { SessionModule } from './session/session.module';
import * as cookieParser from 'cookie-parser';
import { TransformResponseMiddleware } from './middlewares/response.middle';
import { ChatService } from './chat/services/chat/chat.service';
import { StaticModule } from "./static/static.module";

@Module({
  imports: [
    StaticModule,
    SessionModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static', // Set the route prefix for serving static files
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true
    }),
    // TypeOrmModule.forRoot(ormconfig),
    ApiModule, UsersModule, SessionModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, ChatGateway, ChatService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {

    consumer.apply(cookieParser()).forRoutes('*');
    consumer.apply(FirewallMiddleware).forRoutes('*');
    consumer.apply(UserMiddleware).forRoutes('*');
    consumer.apply(TransformResponseMiddleware).forRoutes('*');
  }
}
