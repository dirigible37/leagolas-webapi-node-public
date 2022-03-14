import dotenv from 'dotenv';
import fs from 'fs';
import logger from './logger';

if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

export const NODE_ENV = process.env.NODE_ENV;
export const SERVICE_NAME = process.env.SERVICE_NAME;
export const POSTGRES_SQL_DATABASE = process.env.POSTGRES_SQL_DATABASE;
export const POSTGRES_SQL_USER = process.env.POSTGRES_SQL_USER;
export const POSTGRES_SQL_PASSWORD = process.env.POSTGRES_SQL_PASSWORD;
export const POSTGRES_SQL_POOL_MAX = parseInt(process.env.POSTGRES_SQL_POOL_MAX) || 10;
export const VERBOSE = process.env.VERBOSE === 'true' || false;
export const RIOT_API_KEY = process.env.RIOT_API_KEY;
export const RIOT_BASE_URL_NA = process.env.RIOT_BASE_URL_NA;
export const RIOT_BASE_URL_AMERICAS = process.env.RIOT_BASE_URL_AMERICAS;

if (!NODE_ENV) {
  logger.error('No NODE_ENV provided. Please ensure your .env file includes a NODE_ENV property');
  process.exit();
}
if (!POSTGRES_SQL_DATABASE) {
  logger.error('No postgres database provided. Please ensure your .env file includes a POSTGRES_SQL_DATABASE property');
  process.exit();
}
if (!POSTGRES_SQL_USER) {
  logger.error('No postgres user provided. Please ensure your .env file includes a POSTGRES_SQL_USER property');
  process.exit();
}
if (!POSTGRES_SQL_PASSWORD) {
  logger.error('No postgres password provided. Please ensure your .env file includes a POSTGRES_SQL_PASSWORD property');
  process.exit();
}
if (!RIOT_API_KEY) {
  logger.error('No riot api Key provided. Please ensure your .env file includes a RIOT_API_KEY property');
  process.exit();
}
if (!RIOT_BASE_URL_NA) {
  logger.error('No riot api na1 url provided. Please ensure your .env file includes a RIOT_BASE_URL_NA property');
  process.exit();
}
if (!RIOT_BASE_URL_AMERICAS) {
  logger.error(
    'No riot api americas url provided. Please ensure your .env file includes a RIOT_BASE_URL_AMERICAS property'
  );
  process.exit();
}
