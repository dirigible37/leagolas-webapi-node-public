// 3rd Party Libraries
import cors from 'cors';
import { default as express, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Helpers and Utils
import { sequelize } from './db/sql/client';
import { SERVICE_NAME, POSTGRES_SQL_DATABASE, NODE_ENV } from './utils/constants';
import logger from './utils/logger';
import { rateLimiterMiddleware } from './middleware/rate-limiter';

// Routes
import { PlayerMatchDataRoutes, BanCalculationRoutes } from './routes';

class LeagolasDataService {
  private app = express();
  public constructor() {
    this.start();
  }

  private async start() {
    try {
      // Connect to Database
      await sequelize().authenticate();
      logger.info(`Connected to Postgres Database: ${POSTGRES_SQL_DATABASE}`);
      this.initialize();
      this.applyRoutes();
      this.app.listen(this.app.get('port'), (): void => {
        logger.info(
          `Service ${SERVICE_NAME} is running at http://localhost:${this.app.get('port')} in ${this.app.get(
            'env'
          )} mode`
        );
      });
    } catch (err) {
      logger.error(`Postgres connection error. Please make sure Postgres is running.  ${err.toString()}`);
      process.exit(1);
    }
  }

  private initialize() {
    // Express configuration and Middleware
    this.app.set('port', 6969);
    this.app.set('env', NODE_ENV);
    this.app.use(cors({ origin: '*' }));

    this.app.use(rateLimiterMiddleware);
    // Morgan Setup for logging
    this.app.use(
      morgan('combined', {
        stream: {
          write(text: string): void {
            logger.info(text);
          },
        },
      })
    );
    // Helmet Middleware
    this.app.use(
      helmet({
        referrerPolicy: { policy: 'no-referrer' },
      })
    );
  }

  private applyRoutes() {
    this.app.use('/api/v1/player_match_data', PlayerMatchDataRoutes);
    this.app.use('/api/v1/ban_calculation', BanCalculationRoutes);
    // Health Check
    this.app.get('/health-check', (_, res): Response => res.json({ serviceName: SERVICE_NAME, status: 'Running' }));
  }
}

export default new LeagolasDataService();
