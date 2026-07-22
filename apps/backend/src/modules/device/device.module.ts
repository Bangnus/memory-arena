import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';

@Module({
  controllers: [DeviceController],
})
export class DeviceModule {}
