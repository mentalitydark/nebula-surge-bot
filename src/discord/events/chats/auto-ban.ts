import { FindByGuildGuildSettingsUseCase } from "#application/use-cases/guild-settings/FindByGuildGuildSettingsUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys } from "#entities";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { createEmbed } from "@magicyan/discord";
import { channelMention, roleMention, time, TimestampStyles, userMention } from "discord.js";

const ROLE_ID_TO_USER_BANNED = process.env.ROLE_ID_TO_USER_BANNED || "";

createEvent({
  name: "auto-ban",
  event: "messageCreate",
  async run(message) {
    if (!ROLE_ID_TO_USER_BANNED) {
      return
    }

    const { guild, member, channel } = message

    if (!guild || !member || !channel) {
      return
    }

    if (message.author.bot || member.permissions.has("Administrator")) {
      return
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id');

    const findGuildSettingsUseCase = new FindByGuildGuildSettingsUseCase(new GuildSettingsTypeormRepository(), cache);
    const guildSettings = await findGuildSettingsUseCase.execute(guild.id);

    if (!guildSettings || !guildSettings.settings) {
      return
    }

    const { settings } = guildSettings

    const autoBanChannelIds = settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN)
    const autoBanVoteChannelId = settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)

    if (!autoBanChannelIds || !autoBanVoteChannelId) {
      return
    }

    if (typeof autoBanChannelIds === "string" || (Array.isArray(autoBanChannelIds) && !autoBanChannelIds.includes(channel.id))) {
      return
    }

    const autoBanVoteChannel = await guild.channels.fetch(autoBanVoteChannelId)
    if (!autoBanVoteChannel || !autoBanVoteChannel.isTextBased()) {
      return
    }

    const textChannels = []

    const channels = await guild.channels.fetch()
    for (const c of channels.values()) {
      if (c && c.isTextBased() && c.permissionsFor(member)?.has('SendMessages')) {
        textChannels.push(c)
      }
    }

    let messagesToDeleteCount = 0

    const chunkSize = 5
    for (let i = 0; i < textChannels.length; i += chunkSize) {
      const chunk = textChannels.slice(i, i + chunkSize)

      await Promise.allSettled(
        chunk.map(async (c) => {
          if (!c.permissionsFor(member)?.has('SendMessages')) return

          const messages = await c.messages.fetch({ limit: 10 })
          const messagesToDelete = messages.filter(msg => msg.author.id === member.id)

          if (messagesToDelete.size > 0) {
            await c.bulkDelete(messagesToDelete, true).catch(() => null)
            messagesToDeleteCount += messagesToDelete.size
          }
        })
      ).catch(() => null)
    }

    await member.roles.add(ROLE_ID_TO_USER_BANNED, "Auto-ban")

    if (settings.has(GuildSettingsKeys.CHANNEL_LOGS)) {
      const logChannelId = settings.get(GuildSettingsKeys.CHANNEL_LOGS)
      const logChannel = await guild.channels.fetch(logChannelId!)
      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(`${userMention(member.id)} foi pré banido automaticamente e teve \`${messagesToDeleteCount}\` mensagens deletadas do servidor.`)
      }
    }

    const embed = createEmbed({
      color: constants.colors.danger,
      title: "⚠️ Votação de Ban",
      description: [
        `O membro ${userMention(member.id)} enviou uma mensagem no canal ${channelMention(message.channelId)} e recebeu o cargo ${roleMention(ROLE_ID_TO_USER_BANNED)}.`,
        ``,
        `**Como votar:**`,
        `✅ — Votar pelo **ban** do membro. Com ${2} votos de conselheiros, o membro será banido do servidor.`,
        `❌ — Votar pelo **cancelamento**. Com ${2} votos de conselheiros, o cargo pré ban será removido e o processo será encerrado.`,
      ].join("\n"),
      fields: [
        { name: "👤 Membro", value: userMention(member.id), inline: true },
        { name: "📅 Horário da mensagem", value: time(message.createdTimestamp, TimestampStyles.ShortDateMediumTime), inline: true },
        { name: "💬 Mensagem enviada", value: message.content || "*[sem texto]*", inline: false },
      ],
      footer: `ID do membro: ${member.id}`,
      timestamp: new Date()
    });

    const voteMessage = await autoBanVoteChannel.send({ embeds: [embed] })
    await voteMessage.react("✅")
    await voteMessage.react("❌")

  }
})
