import { Sequelize, Options } from 'sequelize';
import logger from '../../utils/logger';
import {
  POSTGRES_SQL_DATABASE,
  POSTGRES_SQL_USER,
  POSTGRES_SQL_PASSWORD,
  POSTGRES_SQL_POOL_MAX,
  VERBOSE,
} from '../../utils/constants';

const commonOptions: Options = {
  dialect: 'postgres',
  pool: {
    max: POSTGRES_SQL_POOL_MAX,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: VERBOSE ? (msg, milliseconds) => logger.debug(`${msg} - time: ${milliseconds}`) : false,
  logQueryParameters: VERBOSE ? true : false,
  benchmark: VERBOSE ? true : false,
};

export const sequelize = () =>
  new Sequelize(POSTGRES_SQL_DATABASE, POSTGRES_SQL_USER, POSTGRES_SQL_PASSWORD, commonOptions);
