import Redis from 'ioredis';
import { config } from '../config';
import { SessionData } from '../types';

class SessionService {
  private redis: Redis;
  private prefix = 'bot:session:';
  private langPrefix = 'bot:lang:';

  constructor() {
    this.redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    this.redis.on('error', (err) => console.error('Redis error:', err.message));
  }

  async getSession(userId: number): Promise<SessionData> {
    try {
      const raw = await this.redis.get(this.prefix + userId);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async setSession(userId: number, session: SessionData): Promise<void> {
    try {
      await this.redis.set(this.prefix + userId, JSON.stringify(session), 'EX', config.sessionTtl);
    } catch (err) {
      console.error('Session write error:', err);
    }
  }

  async clearSession(userId: number): Promise<void> {
    try {
      await this.redis.del(this.prefix + userId);
    } catch {}
  }

  async getLanguage(userId: number): Promise<string> {
    try {
      return (await this.redis.get(this.langPrefix + userId)) || config.defaultLanguage;
    } catch {
      return config.defaultLanguage;
    }
  }

  async setLanguage(userId: number, lang: string): Promise<void> {
    try {
      await this.redis.set(this.langPrefix + userId, lang);
    } catch {}
  }

  getRedis(): Redis {
    return this.redis;
  }
}

export const sessionService = new SessionService();
