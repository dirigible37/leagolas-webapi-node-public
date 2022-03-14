import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../client';

export class RankData extends Model {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

RankData.init(
  {
    leagueId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    summonerId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    summonerName: {
      type: DataTypes.STRING,
    },
    queueType: {
      type: DataTypes.STRING,
    },
    gameMode: {
      type: DataTypes.STRING,
    },
    tier: {
      type: DataTypes.STRING,
    },
    rank: {
      type: DataTypes.STRING,
    },
    leaguePoints: {
      type: DataTypes.INTEGER,
    },
    wins: {
      type: DataTypes.INTEGER,
    },
    losses: {
      type: DataTypes.INTEGER,
    },
    hotStreak: {
      type: DataTypes.BOOLEAN,
    },
    veteran: {
      type: DataTypes.BOOLEAN,
    },
    freshBlood: {
      type: DataTypes.BOOLEAN,
    },
    inactive: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    tableName: 'rank_data',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
