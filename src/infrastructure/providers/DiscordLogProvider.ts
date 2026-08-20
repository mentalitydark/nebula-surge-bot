import { Client } from "discordx";
import { inject, injectable } from "tsyringe";
import { createEmbed } from "@magicyan/discord";
import { TOKENS } from "@/infrastructure/container/tokens";
import { AuditLogDTO, DiscordLogProviderInterface } from "@/application/providers";

@injectable()
export class DiscordLogProvider implements DiscordLogProviderInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async sendLog(dto: AuditLogDTO): Promise<void> {
    const guild = await this.client.guilds.fetch(dto.guildId);

    if (!guild) {
      return;
    }

    const channel = await guild.channels.fetch(dto.channelId);

    if (!channel || !channel.isTextBased()) {
      return;
    }

    const embed = createEmbed({
      title: dto.title,
      description: dto.description,
      fields: dto.fields,
      color: dto.color,
      timestamp: new Date()
    })

    await channel.send({ embeds: [embed] });
  }

}