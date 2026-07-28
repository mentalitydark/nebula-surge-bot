import { GuildSettingsKeys, Settings } from "#entities";
import { createEmbed } from "@magicyan/discord";
import { Guild } from "discord.js";

export interface LogActionsDto {
  message: string;
  title?: string;
  color?: string;
}

const DEFAULT_TITLE = "📋 Log de Ações";

export class LogActionsUseCase {

  public constructor(
    private readonly guild: Guild,
    private readonly settings: Settings
  ) { }

  public async execute({ message, title = DEFAULT_TITLE, color = constants.colors.default }: LogActionsDto): Promise<void> {
    const channelId = this.settings.get(GuildSettingsKeys.CHANNEL_LOGS);

    if (!channelId) {
      throw new Error("Canal de logs não configurado.");
    }

    const channel = await this.guild.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error("O canal de logs não é um canal de texto.");
    }

    const embed = createEmbed({ color, title, description: message });

    await channel.send({ embeds: [embed] });
  }

}