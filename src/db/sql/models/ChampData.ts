import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../client';

export class ChampData extends Model {
  key: string;
  id: string;
  version: string;
  name: string;
  title: string;
  blurb: string;
  info: object;
  image: object;
  tags: object;
  partype: string;
  stats: object;
}

ChampData.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    id: {
      type: DataTypes.STRING,
    },
    version: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
    },
    blurb: {
      type: DataTypes.STRING,
    },
    info: {
      type: DataTypes.JSON,
    },
    image: {
      type: DataTypes.JSON,
    },
    tags: {
      type: DataTypes.JSON,
    },
    partype: {
      type: DataTypes.STRING,
    },
    stats: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: 'champ_data',
    timestamps: false,
    schema: 'public',
    sequelize: sequelize(),
  }
);
