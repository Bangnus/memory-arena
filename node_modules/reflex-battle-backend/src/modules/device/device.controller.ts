import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class HeartbeatDto {
  deviceId: string;
}

@ApiTags('Device Interface')
@Controller('device')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  @Get('status')
  @ApiOperation({
    summary: 'Check Device Connectivity Status',
    description:
      'ESP32 calls this endpoint to verify backend service availability',
  })
  getStatus() {
    return { status: 'ONLINE', timestamp: new Date().toISOString() };
  }

  @Post('heartbeat')
  @ApiOperation({
    summary: 'ESP32 Device Heartbeat',
    description: 'Periodic heartbeat ping from ESP32 microcontrollers',
  })
  receiveHeartbeat(@Body() body: HeartbeatDto) {
    this.logger.debug(
      `Heartbeat received from device: ${body.deviceId || 'ESP32-DEV'}`,
    );
    return { acknowledged: true, serverTime: new Date().toISOString() };
  }
}
