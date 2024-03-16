import { Module } from '@nestjs/common';
import { ApiService } from './services/api/api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
