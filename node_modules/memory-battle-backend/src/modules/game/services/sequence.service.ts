import { Injectable } from '@nestjs/common';
import { Color, Difficulty } from '../../../common/enums';
import { GAME_CONSTANTS } from '../../../common/constants/game.constants';

@Injectable()
export class SequenceService {
  /**
   * Generates a random color sequence based on selected difficulty.
   */
  generateSequence(difficulty: Difficulty): Color[] {
    const length = GAME_CONSTANTS.SEQUENCE_LENGTH[difficulty] || 4;
    const colors = GAME_CONSTANTS.COLOR_MAP;
    const sequence: Color[] = [];

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      sequence.push(colors[randomIndex]);
    }

    return sequence;
  }
}
