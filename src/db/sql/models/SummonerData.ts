import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../client';

export class SummonerData extends Model {
  public puuid: string;
  public id: string;
  public name: string;
  public accountId: string;
  public profileIconId: number;
  public revisionDate: number;
  public summonerLevel: number;
}

SummonerData.init(
  {
    puuid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    id: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    accountId: {
      type: DataTypes.STRING,
    },
    profileIconId: {
      type: DataTypes.INTEGER,
    },
    revisionDate: {
      type: DataTypes.BIGINT,
    },
    summonerLevel: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'summoner_data',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
