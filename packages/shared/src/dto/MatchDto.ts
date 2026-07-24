import { IPlayerDto } from './PlayerDto.js';
import { IRoundDto } from './RoundDto.js';

export interface IMatchDto {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  players: IPlayerDto[];
  rounds: IRoundDto[];
  winnerPlayerNumber?: 1 | 2 | null;
  createdAt: string;
  updatedAt: string;
}
