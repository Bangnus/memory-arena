import { Module, forwardRef } from '@nestjs/common';
import { SerialService } from './serial.service';
import { GameModule } from '../game/game.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    forwardRef(() => GameModule),
    AdminModule,
  ],
  providers: [SerialService],
  exports: [SerialService],
})
export class SerialModule {}
