import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../client';

export class MasteryData extends Model {
  summonerId: string;
  masteryData: object;
}

MasteryData.init(
  {
    summonerId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    masteryData: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: 'mastery_data',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
    underscored: true,
  }
);
