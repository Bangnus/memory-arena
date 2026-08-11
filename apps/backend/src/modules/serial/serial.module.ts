import { Module, forwardRef } from '@nestjs/common';
import { SerialService } from './serial.service';
import { GameModule } from '../game/game.module';
import { AdminModule } from '../admin/admin.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    forwardRef(() => GameModule),
    AdminModule,
    DeviceModule,
  ],
  providers: [SerialService],
  exports: [SerialService],
})
export class SerialModule {}
