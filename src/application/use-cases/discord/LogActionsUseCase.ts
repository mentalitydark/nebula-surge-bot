import { GuildSettingsKeys, Settings } from "#entities";
import { Guild } from "discord.js";

export class LogActionsUseCase {

  public constructor(
    private readonly guild: Guild,
    private readonly settings: Settings
  ) { }

  public async execute(message: string): Promise<void> {
    const channelId = this.settings.get(GuildSettingsKeys.CHANNEL_LOGS);

    if (!channelId) {
      throw new Error("Canal de logs não configurado.");
    }

    const channel = await this.guild.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error("O canal de logs não é um canal de texto.");
    }

    await channel.send(message);
  }

}