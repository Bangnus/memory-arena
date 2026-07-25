import { Injectable } from '@nestjs/common';
import { Color } from '../../../common/enums';

export interface IValidationResult {
  isCorrect: boolean;
  mistakeIndex: number | null;
}

@Injectable()
export class ValidatorService {
  /**
   * Validates player input sequence against target sequence.
   */
  validateInput(
    targetSequence: Color[],
    playerInput: Color[],
  ): IValidationResult {
    if (!playerInput || playerInput.length !== targetSequence.length) {
      return { isCorrect: false, mistakeIndex: 0 };
    }

    for (let i = 0; i < targetSequence.length; i++) {
      if (playerInput[i] !== targetSequence[i]) {
        return { isCorrect: false, mistakeIndex: i };
      }
    }

    return { isCorrect: true, mistakeIndex: null };
  }
}
