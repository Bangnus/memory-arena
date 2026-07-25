import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HeartbeatDto {
  @ApiProperty({
    description: 'Device identifier',
    example: 'ESP32-001',
  })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({
    description: 'Firmware version',
    example: '1.0.0',
  })
  @IsString()
  @IsOptional()
  firmwareVersion?: string;

  @ApiProperty({
    description: 'Device status',
    example: 'ONLINE',
  })
  @IsString()
  @IsOptional()
  status?: string;
}
