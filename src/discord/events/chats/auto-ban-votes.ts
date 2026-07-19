import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/FindGuildSettingsByGuildIdUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys } from "#entities";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { userMention } from "discord.js";

const ROLE_ID_TO_USER_BANNED = process.env.ROLE_ID_TO_USER_BANNED || "";
const REQUIRED_VOTES = 2

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

    const findGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), cache);
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

    const autoBanVoteChannel = await message.guild.channels.fetch(autoBanVoteChannelId)

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

    const memberIdMatch = voteMessage.embeds[0]?.footer?.text?.match(/ID do membro: (\d+)/)

    const memberId = memberIdMatch ? memberIdMatch[1] : null

    if (!memberId) {
      return
    }

    const member = await message.guild.members.fetch(memberId).catch(() => null)

    if (!member) {
      await voteMessage.reply(`Não foi possível encontrar o membro ${userMention(memberId)} (\`${memberId}\`). A votação será encerrada.`)
      await voteMessage.delete().catch(() => null)
      return
    }

    if (voteCount.yes >= REQUIRED_VOTES) {
      await member.ban({ reason: "Votação de banimento" }).catch(() => null)
      await voteMessage.reply(`O membro ${userMention(member.id)} foi banido do servidor.`)

      await voteMessage.delete().catch(() => null)
    } else if (voteCount.no >= REQUIRED_VOTES) {
      await member.roles.remove(ROLE_ID_TO_USER_BANNED, "Votação de banimento cancelada").catch(() => null)
      await voteMessage.reply(`A votação para banir o membro ${userMention(member.id)} foi cancelada.`)

      await voteMessage.delete().catch(() => null)
    }
  }
})