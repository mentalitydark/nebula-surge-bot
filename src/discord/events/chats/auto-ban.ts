import { FindByGuildGuildSettingsUseCase } from "#application/use-cases/guild-settings/FindByGuildGuildSettingsUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys } from "#entities";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { createEmbed } from "@magicyan/discord";

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

    const autoBanChannelId = guildSettings.settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN)
    const autoBanVoteChannelId = guildSettings.settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)
    const logChannelId = guildSettings.settings.get(GuildSettingsKeys.CHANNEL_LOGS)

    if (!autoBanChannelId || !autoBanVoteChannelId || !logChannelId) {
      return
    }

    if (channel.id !== autoBanChannelId) {
      return
    }

    const autoBanChannel = guild.channels.cache.get(autoBanChannelId)
    const autoBanVoteChannel = guild.channels.cache.get(autoBanVoteChannelId)
    const logChannel = guild.channels.cache.get(logChannelId)

    if (!autoBanChannel || !autoBanVoteChannel || !logChannel || !autoBanChannel.isTextBased() || !autoBanVoteChannel.isTextBased() || !logChannel.isTextBased()) {
      return
    }

    await member.roles.add(ROLE_ID_TO_USER_BANNED, "Auto-ban")

    await logChannel.send(`<@${member.id}> foi pré banido automaticamente.`)

    const channels = await guild.channels.fetch().catch(() => null)

    if (!channels) {
      return
    }

    for (const [, channel] of channels) {
      try {
        if (!channel || !channel.isTextBased()) {
          continue
        }

        const messages = await channel.messages.fetch({ limit: 50 })
        const messagesToDelete = messages.filter(msg => msg.author.id === member.id)

        if (messagesToDelete.size > 0) {
          await channel.bulkDelete(messagesToDelete, true).catch(() => null)
        }
      } catch {
        continue
      }
    }

    const embed = createEmbed({
      color: constants.colors.danger,
      title: "⚠️ Votação de Ban",
      description: [
        `O membro <@${member.id}> enviou uma mensagem no canal <#${message.channelId}> e recebeu o cargo **pré ban**.`,
        ``,
        `**Como votar:**`,
        `✅ — Votar pelo **ban** do membro. Com ${4} votos de conselheiros, o membro será banido do servidor.`,
        `❌ — Votar pelo **cancelamento**. Com ${4} votos de conselheiros, o cargo pré ban será removido e o processo será encerrado.`,
      ].join("\n"),
      fields: [
        { name: "👤 Membro", value: `<@${member.id}> (${member.user.username})`, inline: true },
        { name: "📅 Horário da mensagem", value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: true },
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

createEvent({
  name: "auto-ban-vote",
  event: "messageReactionAdd",
  async run(reaction, user) {
    if (user.bot || !ROLE_ID_TO_USER_BANNED) {
      return
    }

    const { message } = reaction

    if (!message.guild || !message.member || !message.channel) {
      return
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id');

    const findGuildSettingsUseCase = new FindByGuildGuildSettingsUseCase(new GuildSettingsTypeormRepository(), cache);
    const guildSettings = await findGuildSettingsUseCase.execute(message.guild.id);

    if (!guildSettings || !guildSettings.settings) {
      return
    }

    const autoBanVoteChannelId = guildSettings.settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)

    if (!autoBanVoteChannelId) {
      return
    }

    if (message.channel.id !== autoBanVoteChannelId) {
      return
    }

    const autoBanVoteChannel = message.guild.channels.cache.get(autoBanVoteChannelId)

    if (!autoBanVoteChannel || !autoBanVoteChannel.isTextBased()) {
      return
    }

    const voteMessage = await autoBanVoteChannel.messages.fetch(message.id).catch(() => null)

    if (!voteMessage) {
      return
    }

    const voteCount = {
      yes: 0,
      no: 0
    }

    for (const reaction of voteMessage.reactions.cache.values()) {
      if (reaction.emoji.name === "✅") {
        voteCount.yes = reaction.count - 1
      } else if (reaction.emoji.name === "❌") {
        voteCount.no = reaction.count - 1
      }
    }

    const requiredVotes = 4

    const memberIdMatch = voteMessage.embeds[0]?.footer?.text?.match(/ID do membro: (\d+)/)

    const memberId = memberIdMatch ? memberIdMatch[1] : null

    if (!memberId) {
      return
    }

    const member = await message.guild.members.fetch(memberId).catch(() => null)

    if (!member) {
      return
    }

    if (voteCount.yes >= requiredVotes) {
      await member.ban({ reason: "Votação de banimento" }).catch(() => null)
      await voteMessage.reply(`O membro <@${member.id}> foi banido do servidor.`)

      await voteMessage.delete().catch(() => null)
    } else if (voteCount.no >= requiredVotes) {
      await member.roles.remove(ROLE_ID_TO_USER_BANNED, "Votação de banimento cancelada").catch(() => null)
      await voteMessage.reply(`A votação para banir o membro <@${member.id}> foi cancelada.`)

      await voteMessage.delete().catch(() => null)
    }
  }
})