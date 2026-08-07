import { Discord, Guard, On, type ArgsOf } from "discordx";
import { NotBotMiddleware } from "../middlewares";
import { channelMention, Events, Guild, GuildMember, Message, roleMention, userMention } from "discord.js";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { colors } from "@/presentation/constants";
import { autoBanMinimumVotes, channelsId, rolesId } from "@/infrastructure/config";

@Discord()
export class AutoBan {
  private CHUNKS_SIZE = 5;

  @On({ event: Events.MessageCreate })
  @Guard(NotBotMiddleware)
  public async onMessageCreate([message]: ArgsOf<Events.MessageCreate>): Promise<void> {
    const { member, channel, guild } = message;

    if (!member || !guild || !channelsId.autoBan.includes(channel.id)) return;

    if (member.permissions.has("Administrator") || member.roles.cache.has(rolesId.executor)) return;

    const messagesToDeleteCount = await this.removeMessages(guild, member);

    await member.roles.add(rolesId.autoBan, 'Auto ban for sending messages in restricted channels');

    const voteChannel = await guild.channels.fetch(channelsId.autoBanVote);
    if (!voteChannel || !voteChannel.isTextBased()) return;

    const voteMessage = await voteChannel.send({
      embeds: [createEmbed({
        color: colors.danger,
        title: "⚠️ Votação de Ban",
        description: brBuilder(
          `O membro ${userMention(member.id)} enviou uma mensagem no canal ${channelMention(message.channelId)} e recebeu o cargo ${roleMention(rolesId.autoBan)}. \`${messagesToDeleteCount}\` mensagens foram removidas.`,
          '',
          '**Como votar:**',
          `✅ — Votar pelo **ban** do membro. Com ${autoBanMinimumVotes} votos de conselheiros, o membro será banido do servidor.`,
          `❌ — Votar pelo **cancelamento**. Com ${autoBanMinimumVotes} votos de conselheiros, o cargo ${roleMention(rolesId.autoBan)} será removido e o processo será encerrado.`
        ),
        fields: [{ name: "👤 Membro", value: userMention(member.id), inline: true }],
        footer: `ID do membro: \`${member.id}\``,
        timestamp: new Date()
      })]
    })

    await voteMessage.react('✅');
    await voteMessage.react('❌');
  }

  @On({ event: Events.MessageReactionAdd })
  @Guard(NotBotMiddleware)
  public async onVoteReaction([reaction]: ArgsOf<Events.MessageReactionAdd>): Promise<void> {
    const { message } = reaction;
    const { guild } = message;

    if (!guild || channelsId.autoBanVote !== message.channelId) return;

    const voteMessage = message.partial ? await message.fetch() : message;

    const { approve, reject } = this.countVotes(voteMessage);

    if (approve < autoBanMinimumVotes && reject < autoBanMinimumVotes) return;

    const memberId = this.extractMemberIdFromVoteMessage(voteMessage);
    if (!memberId) return;

    const member = await guild.members.fetch(memberId);
    if (!member) return;

    if (approve >= autoBanMinimumVotes) {
      await member.ban({ reason: 'Auto ban for sending messages in restricted channels', deleteMessageSeconds: 7 * 24 * 60 * 60 });
      await voteMessage.reply(`O membro ${userMention(member.id)} foi **banido** do servidor.`);
    } else if (reject >= autoBanMinimumVotes) {
      await member.roles.remove(rolesId.autoBan, 'Auto ban canceled');
      await voteMessage.reply(`O cargo ${roleMention(rolesId.autoBan)} do membro ${userMention(member.id)} foi **removido**.`);
    }

    await voteMessage.delete();
  }

  private extractMemberIdFromVoteMessage(message: Message): string | null {
    const memberIdMatch = message.embeds[0]?.footer?.text?.match(/ID do membro: `(\d+)`/);
    return memberIdMatch ? memberIdMatch[1] : null;
  }

  private countVotes(message: Message): { approve: number, reject: number } {
    let approve = 0;
    let reject = 0;

    for (const reaction of message.reactions.cache.values()) {
      if (reaction.emoji.name === '✅') approve = reaction.count - 1;
      else if (reaction.emoji.name === '❌') reject = reaction.count - 1;
    }

    return { approve, reject };
  }

  private async removeMessages(guild: Guild, member: GuildMember): Promise<number> {
    const channels = await guild.channels.fetch();

    const channelsToDeleteFrom = Array
      .from(channels.values())
      .filter(channel => channel && channel.isTextBased() && channel.permissionsFor(member)?.has('SendMessages'));

    const messagesDeleted: { [channelId: string]: number } = {};

    for (let i = 0; i < channelsToDeleteFrom.length; i += this.CHUNKS_SIZE) {
      const chunk = channelsToDeleteFrom.slice(i, i + this.CHUNKS_SIZE);

      await Promise.allSettled(
        chunk.map(async channel => {
          if (!channel || !channel.isTextBased() || !channel.permissionsFor(member)?.has('SendMessages')) return

          const messages = await channel.messages.fetch({ limit: 100 });
          const memberMessages = messages.filter(msg => msg.author.id === member.id);

          if (memberMessages.size > 0) {
            const deleted = await channel.bulkDelete(memberMessages);

            if (deleted.size > 0) {
              messagesDeleted[channel.id] = deleted.size;
            }
          }
        })
      ).catch(() => null);
    }

    return Object.values(messagesDeleted).reduce((acc, curr) => acc + curr, 0);
  }
}