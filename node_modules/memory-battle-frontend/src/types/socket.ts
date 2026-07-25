import { GameSession, Round, LedColor } from './game';

export interface ServerToClientEvents {
  game_started: (session: GameSession) => void;
  countdown: (count: number) => void;
  round_started: (roundNumber: number) => void;
  show_sequence: (sequence: LedColor[], displaySpeed: number) => void;
  input_phase: () => void;
  round_result: (round: Round) => void;
  match_result: (winner: string) => void;
  game_finished: (session: GameSession) => void;
  session_updated: (session: GameSession) => void;
  error: (message: string) => void;
  system_reset: () => void;
  leaderboard_update: () => void;
}

export interface ClientToServerEvents {
  player_ready: () => void;
  submit_sequence: (sequence: LedColor[]) => void;
}
