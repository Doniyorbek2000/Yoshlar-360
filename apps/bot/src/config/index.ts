import 'dotenv/config';

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  botMode: (process.env.BOT_MODE || 'polling') as 'polling' | 'webhook',
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookPort: parseInt(process.env.WEBHOOK_PORT || '3001'),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  adminIds: (process.env.BOT_ADMIN_IDS || '').split(',').filter(Boolean).map(Number),
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'uz',
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT || '10'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  sessionTtl: parseInt(process.env.SESSION_TTL || '86400'), // 24 hours
};
