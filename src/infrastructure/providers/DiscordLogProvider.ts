import { AuditLogDTO, DiscordLogProviderInterface } from "@/application/providers";
import { colors } from "@/presentation/constants";
import { createEmbed } from "@magicyan/discord";
import { Guild } from "discord.js";

export class DiscordLogProvider implements DiscordLogProviderInterface {

  public constructor(
    private readonly guild: Guild,
    private readonly channelId: string
  ) { }

  public async sendLog(dto: AuditLogDTO): Promise<void> {
    const channel = await this.guild.channels.fetch(this.channelId);

    if (!channel || !channel.isTextBased()) {
      return;
    }

    const embed = createEmbed({
      title: dto.title,
      description: dto.description,
      fields: dto.fields,
      color: dto.color ?? colors.default,
      timestamp: new Date()
    })

    await channel.send({ embeds: [embed] });
  }

}