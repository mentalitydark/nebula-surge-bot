import { CreateBanVoteUseCase } from "#application/use-cases/discord/CreateBanVoteUseCase.js";
import { LogActionsUseCase } from "#application/use-cases/discord/LogActionsUseCase.js";
import { RemoveUserMessagesUseCase } from "#application/use-cases/discord/RemoveUserMessagesUseCase.js";
import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/FindGuildSettingsByGuildIdUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys } from "#entities";
import { suppress } from "#functions";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { channelMention, roleMention, userMention } from "discord.js";

const ROLE_ID_TO_USER_BANNED = process.env.ROLE_ID_TO_USER_BANNED || "";

createEvent({
  name: "auto-ban",
  event: "messageCreate",
  async run(message) {
    if (!ROLE_ID_TO_USER_BANNED) {
      return
    }

    const { guild, member, channel } = message

    if (!guild || !member || !channel || !channel.isTextBased() || message.author.bot || member.permissions.has("Administrator")) {
      return
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id');

    const findGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), cache);
    const guildSettings = await findGuildSettingsUseCase.execute(guild.id);

    if (!guildSettings || !guildSettings.settings) {
      return
    }

    const { settings } = guildSettings

    const logActionsUseCase = new LogActionsUseCase(guild, settings);
    const createBanVoteUseCase = new CreateBanVoteUseCase(guild, settings);
    const removeUserMessagesUseCase = new RemoveUserMessagesUseCase(guild);

    const autoBanChannelIds = settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN)
    const autoBanVoteChannelId = settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)

    if (!autoBanChannelIds || !autoBanVoteChannelId) {
      return
    }

    const autoBanChannelIdList = Array.isArray(autoBanChannelIds) ? autoBanChannelIds : [autoBanChannelIds]

    if (!autoBanChannelIdList.includes(channel.id)) {
      return
    }

    const autoBanVoteChannel = await guild.channels.fetch(autoBanVoteChannelId)
    if (!autoBanVoteChannel || !autoBanVoteChannel.isTextBased()) {
      suppress(() => logActionsUseCase.execute(
        `O canal de votação de banimento configurado (${channelMention(autoBanVoteChannelId)}) não é um canal de texto ou não foi encontrado.`
      ))
      return
    }

    const messagesToDeleteCount = await removeUserMessagesUseCase.execute(member);

    await member.roles.add(ROLE_ID_TO_USER_BANNED, "Auto-ban")

    suppress(() => logActionsUseCase.execute(
      `${userMention(member.id)} recebeu o cargo ${roleMention(ROLE_ID_TO_USER_BANNED)} automaticamente e teve \`${messagesToDeleteCount}\` mensagens deletadas do servidor.`
    ))

    await createBanVoteUseCase.execute(
      member,
      `O membro ${userMention(member.id)} enviou uma mensagem no canal ${channelMention(message.channelId)} e recebeu o cargo ${roleMention(ROLE_ID_TO_USER_BANNED)}.`
    )
  }
})
