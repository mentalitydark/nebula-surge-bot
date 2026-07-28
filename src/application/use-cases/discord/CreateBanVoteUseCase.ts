import { GuildSettingsKeys, Settings } from "#entities";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { Guild, GuildMember, userMention } from "discord.js";

export class CreateBanVoteUseCase {

  public constructor(
    private readonly guild: Guild,
    private readonly settings: Settings
  ) { }

  public async execute(userTarget: GuildMember, reason: string): Promise<void> {
    const channelId = this.settings.get(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE)

    if (!channelId) {
      throw new Error("Canal de votação de banimento não configurado.");
    }

    const channel = await this.guild.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error("O canal de votação de banimento não é um canal de texto.");
    }

    const embed = createEmbed({
      color: constants.colors.danger,
      title: "⚠️ Votação de Ban",
      description: brBuilder(
        reason,
        '',
        '**Como votar:**',
        '✅ — Votar pelo **ban** do membro. Com 2 votos de conselheiros, o membro será banido do servidor.',
        '❌ — Votar pelo **cancelamento**. Com 2 votos de conselheiros, o cargo pré ban será removido e o processo será encerrado.'
      ),
      fields: [{ name: "👤 Membro", value: userMention(userTarget.id), inline: true }],
      footer: `ID do membro: \`${userTarget.id}\``,
      timestamp: new Date()
    });

    const message = await channel.send({ embeds: [embed] });

    message.react("✅");
    message.react("❌");
  }

}