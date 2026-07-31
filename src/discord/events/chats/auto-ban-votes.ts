import { SettingStrategyRegistry } from "#application/strategies/SettingStrategyRegistry.js";
import { BanUserUseCase } from "#application/use-cases/discord/BanUserUseCase.js";
import { LogActionsUseCase } from "#application/use-cases/discord/LogActionsUseCase.js";
import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/FindGuildSettingsByGuildIdUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { suppress } from "#functions";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { Message, userMention } from "discord.js";

function countVotes(message: Message) {
  let yes = 0;
  let no = 0;

  for (const reaction of message.reactions.cache.values()) {
    if (reaction.emoji.name === "✅") yes = reaction.count - 1;
    else if (reaction.emoji.name === "❌") no = reaction.count - 1;
  }

  return { yes, no };
}

function extractMemberId(message: Message): string | null {
  const match = message.embeds[0]?.footer?.text?.match(/ID do membro:\s*`?(\d+)`?/);
  return match?.[1] ?? null;
}

createEvent({
  name: "auto-ban-vote",
  event: "messageReactionAdd",
  async run(reaction, user) {
    if (user.bot) return;

    const { message } = reaction;
    if (!message.guild || !message.channel) return;

    const { guild, channel } = message;

    const findGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), InMemoryCacheProvider.getInstance('guild-settings:id'));
    const guildSettings = await suppress(() => findGuildSettingsUseCase.execute(guild.id));

    if (!guildSettings || !guildSettings.settings) {
      return;
    }

    const settings = guildSettings.settings;

    const logActionsUseCase = new LogActionsUseCase(guild, settings);
    try {
      const autoBanVoteChannelId = SettingStrategyRegistry.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE, guild).get(settings) as string | null;

      if (!autoBanVoteChannelId || channel.id !== autoBanVoteChannelId) {
        return;
      }

      const roleAutoBan = SettingStrategyRegistry.get(GuildSettingsKeys.ROLE_AUTO_BAN, guild).get(settings) as string | null;
      const autoBanMinimumVotes = SettingStrategyRegistry.get(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD, guild).get(settings) as number | null;

      if (!roleAutoBan || !autoBanMinimumVotes) {
        await suppress(() => logActionsUseCase.execute({
          message: `Configurações de banimento automático incompletas. Verifique se os campos \`${Settings.getDescription(GuildSettingsKeys.ROLE_AUTO_BAN)}\` e \`${Settings.getDescription(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD)}\` estão configurados.`,
          color: constants.colors.warning
        }));
        return;
      }

      const voteMessage = message.partial ? await message.fetch() : message;

      const { yes, no } = countVotes(voteMessage);

      if (yes < autoBanMinimumVotes && no < autoBanMinimumVotes) return;

      const memberId = extractMemberId(voteMessage);
      if (!memberId) return;

      const member = await suppress(() => guild.members.fetch(memberId));

      if (!member) {
        await voteMessage.reply(`Não foi possível encontrar o membro ${userMention(memberId)} (\`${memberId}\`). A votação será encerrada.`);
        await suppress(() => voteMessage.delete());
        return;
      }

      if (yes >= autoBanMinimumVotes) {
        await new BanUserUseCase().execute(member, guild, "Votação de banimento");
        await voteMessage.reply(`O membro ${userMention(member.id)} foi banido do servidor.`);
        await suppress(() => logActionsUseCase.execute({ message: `O membro ${userMention(member.id)} foi banido via votação.` }));
      } else {
        await suppress(() => member.roles.remove(roleAutoBan, "Votação de banimento cancelada"));
        await voteMessage.reply(`A votação para banir o membro ${userMention(member.id)} foi cancelada.`);
        await suppress(() => logActionsUseCase.execute({ message: `A votação para banir o membro ${userMention(member.id)} foi cancelada.` }));
      }

      await suppress(() => voteMessage.delete());

    } catch (error) {
      if (error instanceof BadRequestError) {
        await suppress(() => logActionsUseCase.execute({
          message: `Erro ao processar a votação de banimento: ${error.message}`,
          color: constants.colors.danger
        }));
        return;
      }

      throw error;
    }
  }
});
