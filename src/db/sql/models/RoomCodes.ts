import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../client';

export class RoomCodes extends Model {
  roomCodeId: string;
  playerPuuids: string[];
}

RoomCodes.init(
  {
    roomCodeId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    playerPuuids: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    tableName: 'room_codes',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
