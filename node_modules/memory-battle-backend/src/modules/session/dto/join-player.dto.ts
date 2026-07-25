import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class JoinPlayerDto {
  @ApiProperty({
    description: 'Player slot number (1 or 2)',
    example: 1,
    minimum: 1,
    maximum: 2,
  })
  @IsInt()
  @Min(1)
  @Max(2)
  playerNumber: number;
}
