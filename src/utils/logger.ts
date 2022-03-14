import winston from 'winston';

const colors = {
  trace: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red',
};

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.colorize({ colors }), winston.format.simple()),
  transports: new winston.transports.Console({ level: process.env.VERBOSE === 'true' ? 'debug' : 'info' }),
});

logger.debug('Logging initialized');

export default logger;
