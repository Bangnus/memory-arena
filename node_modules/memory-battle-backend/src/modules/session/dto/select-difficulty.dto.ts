import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Difficulty } from '../../../common/enums';

export class SelectDifficultyDto {
  @ApiProperty({
    description: 'Game difficulty mode',
    enum: Difficulty,
    example: Difficulty.MEDIUM,
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;
}
