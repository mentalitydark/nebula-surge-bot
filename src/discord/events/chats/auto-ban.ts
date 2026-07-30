import { SettingStrategyRegistry } from "#application/strategies/SettingStrategyRegistry.js";
import { CreateBanVoteUseCase, LogActionsUseCase, RemoveUserMessagesUseCase } from "#application/use-cases/discord/index.js";
import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/index.js";
import { createEvent } from "#base";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { suppress } from "#functions";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { channelMention, roleMention, userMention } from "discord.js";

createEvent({
  name: "auto-ban",
  event: "messageCreate",
  async run(message) {
    const { guild, member, channel } = message

    if (!guild || !member || !channel || !channel.isTextBased() || message.author.bot || member.permissions.has("Administrator")) {
      return
    }

    const findGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), InMemoryCacheProvider.getInstance('guild-settings:id'));

    const guildSettings = await suppress(() => findGuildSettingsUseCase.execute(guild.id));

    if (!guildSettings || !guildSettings.settings) {
      return;
    }

    const settings = guildSettings.settings;

    const logActionsUseCase = new LogActionsUseCase(guild, settings);

    try {
      const autoBanChannelIds = SettingStrategyRegistry.get(GuildSettingsKeys.CHANNEL_AUTO_BAN, guild).get(settings) as string[] | null
      if (!autoBanChannelIds || !autoBanChannelIds.includes(channel.id)) {
        return
      }

      const roleAutoBan = SettingStrategyRegistry.get(GuildSettingsKeys.ROLE_AUTO_BAN, guild).get(settings) as string | null
      const autoBanVoteChannelId = SettingStrategyRegistry.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE, guild).get(settings) as string | null
      const autoBanMinimumVotes = SettingStrategyRegistry.get(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD, guild).get(settings) as number | null

      if (!roleAutoBan || !autoBanVoteChannelId || !autoBanMinimumVotes) {
        await suppress(() => logActionsUseCase.execute({
          message: `Configurações de banimento automático incompletas. Verifique se os campos \`${Settings.getDescription(GuildSettingsKeys.ROLE_AUTO_BAN)}\`, \`${Settings.getDescription(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)}\` e \`${Settings.getDescription(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD)}\` estão configurados.`,
          color: constants.colors.warning,
        }))
        return
      }

      const autoBanVoteChannel = await guild.channels.fetch(autoBanVoteChannelId)
      if (!autoBanVoteChannel || !autoBanVoteChannel.isTextBased()) {
        throw new BadRequestError(`O canal de votação de banimento configurado (${channelMention(autoBanVoteChannelId)}) não é um canal de texto ou não foi encontrado.`)
      }

      const removeUserMessagesUseCase = new RemoveUserMessagesUseCase(guild);
      const messagesToDeleteCount = await removeUserMessagesUseCase.execute(member);

      await member.roles.add(roleAutoBan, "Auto-ban")

      const createBanVoteUseCase = new CreateBanVoteUseCase(guild, settings);
      await createBanVoteUseCase.execute(member,
        `O membro ${userMention(member.id)} enviou uma mensagem no canal ${channelMention(message.channelId)} e recebeu o cargo ${roleMention(roleAutoBan)}. \`${messagesToDeleteCount}\` mensagens foram removidas.`
      )

    } catch (error) {
      if (error instanceof BadRequestError) {
        await suppress(() => logActionsUseCase.execute({
          message: `Erro ao tentar banir o membro ${userMention(member.id)}: ${error.message}`,
          color: constants.colors.danger
        }))

        return
      }

      throw error
    }
  }
})