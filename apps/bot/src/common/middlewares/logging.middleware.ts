import { BotContext } from '../../types';

export async function loggingMiddleware(ctx: BotContext, next: () => Promise<void>): Promise<void> {
  const start = Date.now();
  const userId = ctx.from?.id;
  const type = ctx.updateType;
  const text = (ctx.message as any)?.text?.slice(0, 50) || (ctx.callbackQuery as any)?.data || '';

  await next();

  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${type} | user:${userId} | "${text}" | ${ms}ms`);
}
