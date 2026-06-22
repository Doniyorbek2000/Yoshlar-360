import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { config } from './config';
import { BotContext } from './types';

// Middlewares
import { loggingMiddleware } from './common/middlewares/logging.middleware';
import { rateLimitMiddleware } from './common/middlewares/rate-limit.middleware';

// Handlers
import { registerStartHandler } from './handlers/start.handler';
import { registerMenuHandler } from './handlers/menu.handler';
import { registerAppealsHandler } from './handlers/appeals.handler';
import { registerAdminHandler } from './handlers/admin.handler';
import { registerTasksHandler } from './handlers/tasks.handler';
import { registerNotificationsHandler } from './handlers/notifications.handler';
import { registerSettingsHandler } from './handlers/settings.handler';

// Scenes
import { registerRegistrationScene } from './scenes/registration.scene';
import { registerAppealCreateScene } from './scenes/appeal-create.scene';
import { registerProfileEditScene } from './scenes/profile-edit.scene';
import { registerProblemCreateScene } from './scenes/problem-create.scene';
import { registerBroadcastScene } from './scenes/broadcast.scene';

if (!config.botToken) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Telegraf<BotContext>(config.botToken);

// Global middlewares
bot.use(loggingMiddleware);
bot.use(rateLimitMiddleware);

// Register all handlers and scenes
registerStartHandler(bot);
registerRegistrationScene(bot);
registerAppealCreateScene(bot);
registerProfileEditScene(bot);
registerProblemCreateScene(bot);
registerBroadcastScene(bot);
registerAppealsHandler(bot);
registerAdminHandler(bot);
registerTasksHandler(bot);
registerNotificationsHandler(bot);
registerSettingsHandler(bot);

// Menu handler must be registered last (it has the catch-all text handler)
registerMenuHandler(bot);

// Error handler
bot.catch((err: any, ctx: any) => {
  console.error(`Bot error for ${ctx.updateType}:`, err);
  try {
    ctx.reply('An error occurred. Please try again.').catch(() => {});
  } catch {}
});

// Launch
async function launch() {
  if (config.botMode === 'webhook') {
    const webhookPath = `/bot${config.botToken}`;
    await bot.telegram.setWebhook(`${config.webhookUrl}${webhookPath}`);

    const { createServer } = await import('http');
    const server = createServer(await bot.createWebhook({ domain: config.webhookUrl, path: webhookPath }));
    server.listen(config.webhookPort, () => {
      console.log(`Yoshlar 360 Bot running in webhook mode on port ${config.webhookPort}`);
    });
  } else {
    await bot.launch();
    console.log('Yoshlar 360 Bot running in polling mode');
  }
}

launch().catch((err) => {
  console.error('Failed to launch bot:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
