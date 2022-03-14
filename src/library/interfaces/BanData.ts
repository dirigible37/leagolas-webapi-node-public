import { ChampData } from './PlayerMatchData';

export interface BanData {
  local_scoring: { [key: string]: ChampData[] };
  global_scoring: ChampData[];
}
