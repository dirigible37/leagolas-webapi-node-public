import { Model, DataTypes } from 'sequelize';
import { PlayerData } from '../../../library/interfaces';
import { sequelize } from '../client';

export class PlayerDataCache extends Model {
  summonerPuuid: string;
  playerData: PlayerData;
  createdAt: Date;
  updatedAt: Date;
}

PlayerDataCache.init(
  {
    summonerPuuid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    playerData: {
      type: DataTypes.JSON,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'player_data_cache',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
