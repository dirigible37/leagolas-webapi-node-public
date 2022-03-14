import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextFunction, Request, Response } from 'express';

const rateLimiter = new RateLimiterMemory({ points: 10, duration: 1 });

export async function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    await rateLimiter.consume(req.get('X-Real-IP') || req.ip);
    return next();
  } catch (err) {
    return res.sendStatus(429);
  }
}
