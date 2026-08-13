import 'dotenv/config';
import 'reflect-metadata';
import { GatewayIntentBits, Partials } from 'discord.js';
import { Client } from 'discordx';
import { importx } from '@discordx/importer';
import { env } from '@/infrastructure/env';
import { ConsoleLoggerProvider } from '@/infrastructure/providers';
import { Events } from 'discord.js';
import { LoggerMiddleware } from '@/presentation/middlewares';

const logger = new ConsoleLoggerProvider(console);

const client = new Client({
  botGuilds: env.NODE_ENV === 'development' ? [env.GUILD_ID] : undefined,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Reaction,
    Partials.User
  ],
  silent: false,
  guards: [LoggerMiddleware]
});

client.once(Events.ClientReady, async () => {
  await client.initApplicationCommands();
  logger.success(`Bot online: ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await client.executeInteraction(interaction);
  } catch (error: unknown) {
    const isError = error instanceof Error;
    logger.error(isError ? error : String(error));
  }
});

(async () => {
  await importx(`${__dirname}/presentation/**/*.{ts,js}`);
  await client.login(env.BOT_TOKEN);
})();
