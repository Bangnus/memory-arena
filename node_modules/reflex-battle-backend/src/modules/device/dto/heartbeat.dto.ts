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
}
