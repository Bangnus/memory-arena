import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { BroadcastService } from '../socket/broadcast.service';
import { SocketEvent } from '../../common/enums';

@ApiTags('Device Interface')
@Controller('device')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(
    private readonly deviceService: DeviceService,
    private readonly broadcast: BroadcastService,
  ) {}

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

  @Post('start')
  @ApiOperation({
    summary: 'IoT START button pressed',
    description: 'ESP32 signals that START button was pressed, triggers game flow on frontend',
  })
  @ApiResponse({ status: 200, description: 'Start signal broadcasted' })
  handleStart() {
    this.logger.log('START button pressed from IoT device');
    this.broadcast.emit(SocketEvent.SYSTEM_RESET, { reset: true });
    this.broadcast.emit('device:start', { timestamp: new Date().toISOString() });
    return { success: true };
  }
}
