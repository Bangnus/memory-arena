import { Injectable, Logger } from '@nestjs/common';

interface DeviceStatus {
  deviceId: string;
  lastSeen: Date;
  isOnline: boolean;
}

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly devices = new Map<string, DeviceStatus>();

  updateHeartbeat(deviceId: string): void {
    this.devices.set(deviceId, {
      deviceId,
      lastSeen: new Date(),
      isOnline: true,
    });
  }

  getDeviceStatus(deviceId: string): DeviceStatus | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): DeviceStatus[] {
    return Array.from(this.devices.values());
  }

  markOffline(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isOnline = false;
    }
  }
}
