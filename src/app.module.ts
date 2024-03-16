import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RestModule } from './rest/rest.module';
import { FirewallMiddleware } from './middlewares/firewall.middle';
import { UserMiddleware } from './middlewares/user.middle';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ormconfig } from './orm.config';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static', // Set the route prefix for serving static files
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true
    }),
    // TypeOrmModule.forRoot(ormconfig),
    ApiModule, RestModule, UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FirewallMiddleware).forRoutes('*');
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
