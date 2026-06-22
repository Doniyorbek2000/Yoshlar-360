import { BotContext } from '../../types';
import { sessionService } from '../../services/session.service';
import { config } from '../../config';
import { t } from '../../i18n';

const rateLimitPrefix = 'bot:rate:';

export async function rateLimitMiddleware(ctx: BotContext, next: () => Promise<void>): Promise<void> {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  const redis = sessionService.getRedis();
  const key = rateLimitPrefix + userId;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 60);
    }
    if (current > config.rateLimitPerMinute) {
      const lang = await sessionService.getLanguage(userId);
      await ctx.reply(t(lang, 'rateLimited'));
      return;
    }
  } catch {}

  return next();
}
