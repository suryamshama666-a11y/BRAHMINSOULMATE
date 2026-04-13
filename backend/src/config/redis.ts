import Redis from 'ioredis';
import * as Sentry from '@sentry/node';

const redisUrl = process.env.REDIS_URL;

class RedisService {
  private static instance: Redis | null = null;

  public static getInstance(): Redis | null {
    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL not found. Rate limiting will fall back to in-memory store.');
      return null;
    }

    if (!this.instance) {
      try {
        this.instance = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
        });

        this.instance.on('error', (err) => {
          console.error('❌ Redis Connection Error:', err);
          Sentry.captureException(err);
        });

        this.instance.on('connect', () => {
          console.log('✅ Connected to Redis successfully');
        });
      } catch (error) {
        console.error('❌ Failed to initialize Redis:', error);
        Sentry.captureException(error);
        return null;
      }
    }

    return this.instance;
  }
}

export const redis = RedisService.getInstance();
