export interface IRoundDto {
  id: string;
  roundNumber: number;
  sequence: number[];
  difficulty: string;
  winnerPlayerNumber?: 1 | 2 | null;
  startedAt?: string;
  completedAt?: string;
}
