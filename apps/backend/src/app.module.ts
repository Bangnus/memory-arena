import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { SocketModule } from './modules/socket/socket.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlayerModule } from './modules/player/player.module';
import { SessionModule } from './modules/session/session.module';
import { GameModule } from './modules/game/game.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { HistoryModule } from './modules/history/history.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeviceModule } from './modules/device/device.module';
import { HealthModule } from './modules/health/health.module';
import { SerialModule } from './modules/serial/serial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', '../.env'],
      load: [configuration],
    }),
    PrismaModule,
    SocketModule,
    AuthModule,
    PlayerModule,
    SessionModule,
    GameModule,
    LeaderboardModule,
    HistoryModule,
    AdminModule,
    DeviceModule,
    HealthModule,
    SerialModule,
  ],
})
export class AppModule {}
