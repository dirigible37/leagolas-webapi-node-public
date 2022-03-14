import { PlayerDto } from './PlayerDto';

export interface ClashTeamDto {
  id: string;
  tournamentId: number;
  name: string;
  iconId: number;
  tier: number;
  captain: string;
  abbreviation: string;
  players: PlayerDto[];
  playerNames?: string[];
}
