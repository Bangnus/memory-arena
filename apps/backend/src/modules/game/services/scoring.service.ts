import { Injectable } from '@nestjs/common';
import { GAME_CONSTANTS } from '../../../common/constants/game.constants';

export interface IRoundEvaluationInput {
  player1Correct: boolean;
  player1Time: number;
  player2Correct: boolean;
  player2Time: number;
}

export interface IRoundEvaluationResult {
  winnerPlayerNumber: 1 | 2 | null;
  shouldRestartRound: boolean;
}

@Injectable()
export class ScoringService {
  /**
   * Evaluates round result based on correctness and completion time.
   */
  evaluateRound(input: IRoundEvaluationInput): IRoundEvaluationResult {
    const { player1Correct, player1Time, player2Correct, player2Time } = input;

    if (player1Correct && !player2Correct) {
      return { winnerPlayerNumber: 1, shouldRestartRound: false };
    }

    if (!player1Correct && player2Correct) {
      return { winnerPlayerNumber: 2, shouldRestartRound: false };
    }

    if (player1Correct && player2Correct) {
      // Tie-breaker: lowest completion time wins
      const winnerPlayerNumber = player1Time <= player2Time ? 1 : 2;
      return { winnerPlayerNumber, shouldRestartRound: false };
    }

    // Both failed or timed out -> Tie-breaker by faster response time (or P1 if equal)
    const winnerPlayerNumber = (player1Time > 0 && (player2Time === 0 || player1Time <= player2Time)) ? 1 : 2;
    return { winnerPlayerNumber, shouldRestartRound: false };
  }

  /**
   * Checks if match has reached a winner (Best of 5 -> 3 wins required).
   */
  checkMatchWinner(player1Score: number, player2Score: number): 1 | 2 | null {
    if (player1Score >= GAME_CONSTANTS.MAX_WIN_POINTS) return 1;
    if (player2Score >= GAME_CONSTANTS.MAX_WIN_POINTS) return 2;
    return null;
  }
}
