import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { HeartbeatDto } from './dto/heartbeat.dto';

@ApiTags('Device Interface')
@Controller('device')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Check Device Connectivity Status',
    description:
      'ESP32 calls this endpoint to verify backend service availability',
  })
  @ApiResponse({ status: 200, description: 'Device status retrieved successfully' })
  getStatus() {
    return { status: 'ONLINE', timestamp: new Date().toISOString() };
  }

  @Post('heartbeat')
  @ApiOperation({
    summary: 'ESP32 Device Heartbeat',
    description: 'Periodic heartbeat ping from ESP32 microcontrollers',
  })
  @ApiResponse({ status: 201, description: 'Heartbeat acknowledged successfully' })
  receiveHeartbeat(@Body() body: HeartbeatDto) {
    const deviceId = body.deviceId || 'ESP32-DEV';
    this.logger.debug(`Heartbeat received from device: ${deviceId}`);
    this.deviceService.updateHeartbeat(deviceId);
    return { acknowledged: true, serverTime: new Date().toISOString() };
  }
}
