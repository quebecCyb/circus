import { Module } from '@nestjs/common';
import { RestController } from './controllers/rest/rest.controller';

@Module({
  controllers: [RestController]
})
export class RestModule {}
