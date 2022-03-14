export interface WinrateAndPositionPercent {
  winrate: number;
  percentage: number;
}

export interface PositionPercentageAndWinrate {
  Top: WinrateAndPositionPercent;
  Jungle: WinrateAndPositionPercent;
  Mid: WinrateAndPositionPercent;
  Adc: WinrateAndPositionPercent;
  Support: WinrateAndPositionPercent;
}

export interface MatchHistoryData {
  k: number;
  d: number;
  a: number;
  kda: number;
  champion: string;
  matchId: number;
  points: number;
  position: string;
  queueType: string;
  won: boolean;
}

export interface BanScoreData {
  scaledLocalScore?: number;
  scaledGlobalScore?: number;
  globalScore?: number;
  localScore?: number;
  clashScore?: number;
  rankedScore?: number;
  recentScore?: number;
  masteryScore?: number;
  matchHistoryScore?: number;
}

export interface ChampData extends BanScoreData {
  champion: string;
  playCount: number;
  points: number;
  kda: number;
  winrate: number;
  playerName?: string;
  position?: string;
}

export interface ChampDataLists {
  clashChamps: ChampData[];
  rankedChamps: ChampData[];
  recentChamps: ChampData[];
  masteryChamps: ChampData[];
}

export interface PlayerData extends ChampDataLists {
  flexRank: string;
  soloRank: string;
  playerName: string;
  clashRole: string;
  kda: number;
  winrate: number;
  positionPercentages: PositionPercentageAndWinrate;
  matchHistory: MatchHistoryData[];
}
