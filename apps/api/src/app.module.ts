import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthController } from './health/health.controller';
import { LogsModule } from './logs/logs.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UsersModule,
    AuthModule,
    LogsModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
