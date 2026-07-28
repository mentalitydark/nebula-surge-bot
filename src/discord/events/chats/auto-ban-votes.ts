import { BanUserUseCase } from "#application/use-cases/discord/BanUserUseCase.js";
import { LogActionsUseCase } from "#application/use-cases/discord/LogActionsUseCase.js";
import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/FindGuildSettingsByGuildIdUseCase.js";
import { createEvent } from "#base";
import { GuildSettingsKeys } from "#entities";
import { suppress } from "#functions";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { Message, userMention } from "discord.js";

const ROLE_ID_TO_USER_BANNED = process.env.ROLE_ID_TO_USER_BANNED || "";
const REQUIRED_VOTES = 2;

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
    if (user.bot || !ROLE_ID_TO_USER_BANNED) return;

    const { message } = reaction;
    if (!message.guild || !message.channel) return;

    const { guild, channel } = message;

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id');
    const findGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), cache);
    const guildSettings = await findGuildSettingsUseCase.execute(guild.id);

    const settings = guildSettings?.settings;
    if (!settings) return;

    const autoBanVoteChannelId = settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE);
    if (!autoBanVoteChannelId || channel.id !== autoBanVoteChannelId) return;

    const voteChannel = await guild.channels.fetch(autoBanVoteChannelId);
    if (!voteChannel?.isTextBased()) return;

    const voteMessage = await suppress(() => voteChannel.messages.fetch(message.id));
    if (!voteMessage) return;

    const { yes, no } = countVotes(voteMessage);
    if (yes < REQUIRED_VOTES && no < REQUIRED_VOTES) return;

    const memberId = extractMemberId(voteMessage);
    if (!memberId) return;

    const logActionsUseCase = new LogActionsUseCase(guild, settings);

    const member = await suppress(() => guild.members.fetch(memberId));

    if (!member) {
      await voteMessage.reply(`Não foi possível encontrar o membro ${userMention(memberId)} (\`${memberId}\`). A votação será encerrada.`);
      await suppress(() => voteMessage.delete());
      return;
    }

    if (yes >= REQUIRED_VOTES) {
      await new BanUserUseCase().execute(member, guild, "Votação de banimento");
      await voteMessage.reply(`O membro ${userMention(member.id)} foi banido do servidor.`);
      await suppress(() => logActionsUseCase.execute({ message: `O membro ${userMention(member.id)} foi banido via votação.` }));
    } else {
      await suppress(() => member.roles.remove(ROLE_ID_TO_USER_BANNED, "Votação de banimento cancelada"));
      await voteMessage.reply(`A votação para banir o membro ${userMention(member.id)} foi cancelada.`);
      await suppress(() => logActionsUseCase.execute({ message: `A votação para banir o membro ${userMention(member.id)} foi cancelada.` }));
    }

    await suppress(() => voteMessage.delete());
  }
});
