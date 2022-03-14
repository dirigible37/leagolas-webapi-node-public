import { Model, DataTypes } from 'sequelize';
import { ParticipantDto, TeamDto } from '../../../library/interfaces';
import { sequelize } from '../client';

export class MatchData extends Model {
  matchId: string;
  gameId: number;
  gameCreation: number;
  gameDuration: number;
  gameStartTimestamp: number;
  gameEndTimestamp: number;
  gameMode: string;
  gameName: string;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantDto[];
  platformId: string;
  queueId: number;
  teams: TeamDto[];
  tournamentCode: string;
}

MatchData.init(
  {
    matchId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    gameId: {
      type: DataTypes.BIGINT,
    },
    gameCreation: {
      type: DataTypes.BIGINT,
    },
    gameDuration: {
      type: DataTypes.BIGINT,
    },
    gameStartTimestamp: {
      type: DataTypes.BIGINT,
    },
    gameEndTimestamp: {
      type: DataTypes.BIGINT,
    },
    gameMode: {
      type: DataTypes.STRING,
    },
    gameName: {
      type: DataTypes.STRING,
    },
    gameType: {
      type: DataTypes.STRING,
    },
    gameVersion: {
      type: DataTypes.STRING,
    },
    mapId: {
      type: DataTypes.INTEGER,
    },
    participants: {
      type: DataTypes.JSONB,
    },
    platformId: {
      type: DataTypes.STRING,
    },
    queueId: {
      type: DataTypes.INTEGER,
    },
    teams: {
      type: DataTypes.JSONB,
    },
    tournamentCode: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'match_data',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
