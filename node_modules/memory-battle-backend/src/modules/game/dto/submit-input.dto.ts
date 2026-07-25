import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Color } from '../../../common/enums';

export class PlayerInputDto {
  @ApiProperty({
    description: 'Array of pressed colors',
    enum: Color,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Color, { each: true })
  input: Color[];

  @ApiProperty({
    description: 'Time taken to complete inputs in milliseconds',
    example: 2150,
  })
  @IsInt()
  @Min(0)
  time: number;
}

export class SubmitInputDto {
  @ApiProperty({ description: 'Current GameSession CUID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Current Round Number', example: 1 })
  @IsInt()
  @Min(1)
  round: number;

  @ApiProperty({ type: PlayerInputDto })
  @ValidateNested()
  @Type(() => PlayerInputDto)
  player1: PlayerInputDto;

  @ApiProperty({ type: PlayerInputDto })
  @ValidateNested()
  @Type(() => PlayerInputDto)
  player2: PlayerInputDto;
}
