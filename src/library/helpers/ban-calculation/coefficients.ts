export const MATCH_TYPE_ADJUSTMENTS = {
  clashChamps: 0.05,
  rankedChamps: 1,
  recentChamps: 1,
  masteryChamps: 1,
};

export const RANKED_TIER_SCORES: Record<string, number> = {
  UNRANKED: 1,
  IRON: 1,
  BRONZE: 1.1,
  SILVER: 1.2,
  GOLD: 1.5,
  PLATINUM: 2,
  DIAMOND: 3,
};

export const RANKED_DIVISION_SCORES: Record<string, number> = {
  UNRANKED: 1,
  IV: 1,
  III: 1.1,
  II: 1.2,
  I: 1.3,
};

export const GAREN_CHAMPS = [
  'Garen',
  'Darius',
  'Ornn',
  'Kassadin',
  'Katarina',
  'Talon',
  'Malazahar',
  'Veigar',
  'Hecarim',
  'Shen',
  'Nocturne',
  'Swain',
  'Yasuo',
  'Yone',
];

export const GAREN_COEFFICIENT_MANUAL_ADJUSTMENT = 1.07;
export const WINRATE_COEFFICIENT = 0.7;
export const KDA_COEFFICIENT = 0.7;
