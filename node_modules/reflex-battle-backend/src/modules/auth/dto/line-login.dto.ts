import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LineLoginDto {
  @ApiProperty({
    description: 'LINE Authorization Code from OAuth login flow',
    example: 'auth_code_xyz123',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
