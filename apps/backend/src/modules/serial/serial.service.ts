import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { GameEngineService } from '../game/services/game-engine.service';
import { BroadcastService } from '../socket/broadcast.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class SerialService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SerialService.name);
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;

  constructor(
    @Inject(forwardRef(() => GameEngineService))
    private readonly gameEngine: GameEngineService,
    private readonly broadcast: BroadcastService,
    private readonly adminService: AdminService,
  ) {}

  async onModuleInit() {
    await this.initSerialPort();
  }

  onModuleDestroy() {
    this.closePort();
  }

  private async initSerialPort() {
    const configuredPort = process.env.SERIAL_PORT;
    let targetPortPath = configuredPort;

    if (!targetPortPath) {
      try {
        const ports = await SerialPort.list();
        this.logger.log(`Available serial ports: ${JSON.stringify(ports.map(p => p.path))}`);
        const espPort = ports.find(
          p =>
            p.manufacturer?.toLowerCase().includes('espressif') ||
            p.manufacturer?.toLowerCase().includes('silicon labs') ||
            p.vendorId?.toLowerCase() === '303a' ||
            p.vendorId?.toLowerCase() === '10c4' ||
            p.path.includes('ttyUSB') ||
            p.path.includes('ttyACM'),
        );
        if (espPort) {
          targetPortPath = espPort.path;
        }
      } catch (err) {
        this.logger.error(`Error listing serial ports: ${err.message}`);
      }
    }

    if (!targetPortPath) {
      this.logger.warn(
        'No USB Serial port detected or configured via SERIAL_PORT. USB hardware mode disabled. (Waiting for reconnection or manual setting)',
      );
      return;
    }

    this.connectPort(targetPortPath);
  }

  private connectPort(path: string) {
    try {
      this.logger.log(`Connecting to ESP32 USB Serial at ${path} (Baud: 115200)...`);
      this.port = new SerialPort({
        path,
        baudRate: 115200,
        autoOpen: false,
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      this.port.open((err) => {
        if (err) {
          this.logger.error(`Failed to open serial port ${path}: ${err.message}`);
          return;
        }
        this.logger.log(`USB Serial Port ${path} connected successfully!`);
      });

      this.parser.on('data', (data: string) => {
        this.handleIncomingData(data.trim());
      });

      this.port.on('error', (err) => {
        this.logger.error(`Serial port error: ${err.message}`);
      });

      this.port.on('close', () => {
        this.logger.warn(`Serial port ${path} closed. Re-checking in 5s...`);
        setTimeout(() => this.initSerialPort(), 5000);
      });
    } catch (err) {
      this.logger.error(`Exception initializing serial port ${path}: ${err.message}`);
    }
  }

  private handleIncomingData(line: string) {
    if (!line) return;
    this.logger.log(`[USB Serial IN]: ${line}`);

    if (line.startsWith('BTN:')) {
      const btn = line.substring(4);
      this.processButtonEvent(btn);
    } else if (line === 'RESTART') {
      this.logger.warn('[USB Serial] Physical RESTART button pressed via USB!');
      this.adminService.resetSystem();
    }
  }

  private processButtonEvent(btn: string) {
    if (btn === 'START') {
      this.broadcast.emit('device:start', { timestamp: new Date().toISOString() });
    } else if (btn === 'NEXT') {
      this.broadcast.emit('device:mode_change', { direction: 'NEXT' });
    } else if (btn === 'PREV') {
      this.broadcast.emit('device:mode_change', { direction: 'PREV' });
    } else if (btn === 'RESTART') {
      this.adminService.resetSystem();
    } else if (btn.startsWith('P1_') || btn.startsWith('P2_')) {
      const parts = btn.split('_');
      const playerNum = parts[0] === 'P1' ? 1 : 2;
      const color = parts[1];
      this.gameEngine.broadcastPress(playerNum, color);
    }
  }

  send(message: string) {
    if (this.port && this.port.isOpen) {
      this.port.write(`${message}\n`, (err) => {
        if (err) {
          this.logger.error(`Failed to write to Serial USB: ${err.message}`);
        } else {
          this.logger.log(`[USB Serial OUT]: ${message}`);
        }
      });
    }
  }

  private closePort() {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
  }
}
