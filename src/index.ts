import 'dotenv/config'
import 'reflect-metadata'
import { importx } from '@discordx/importer'
import { GatewayIntentBits, Partials, Events } from 'discord.js'
import { Client } from 'discordx'
import { container } from 'tsyringe'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { type LoggerProviderInterface } from '@/application/providers'
import { setupContainer } from '@/infrastructure/container'
import { env } from '@/infrastructure/env'
import { OnErrorChatInputCommandInteractionMiddleware, OnErrorMiddleware } from '@/presentation/middlewares'

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
  guards: [OnErrorMiddleware, OnErrorChatInputCommandInteractionMiddleware]
})

setupContainer(client)

client.once(Events.ClientReady, async () => {
  await client.initApplicationCommands()

  const logger = container.resolve<LoggerProviderInterface>(APPLICATION_TOKENS.LoggerProviderInterface)
  logger.success(`Bot online: ${client.user?.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  await client.executeInteraction(interaction)
});

(async () => {
  await importx(`${__dirname}/presentation/{commands,events}/**/*.{ts,js}`)
  await client.login(env.BOT_TOKEN)
})()
