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

  isAnyDeviceOnline(): boolean {
    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 30_000;
    for (const device of this.devices.values()) {
      if (now - device.lastSeen.getTime() < ONLINE_THRESHOLD_MS) {
        return true;
      }
    }
    return false;
  }

  markOffline(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isOnline = false;
    }
  }
}
