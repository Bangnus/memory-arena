export interface IPlayerDto {
  id: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  score: number;
  isActive: boolean;
}
