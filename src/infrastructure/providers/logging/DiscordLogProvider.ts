import { createEmbed } from '@magicyan/discord'
import { type Client } from 'discordx'
import { inject, injectable } from 'tsyringe'

import type { DiscordLogDto, DiscordLogInterface } from '@/application/contracts'

import { TOKENS } from '@/infrastructure/container/tokens'

@injectable()
export class DiscordLogProvider implements DiscordLogInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async sendLog(dto: DiscordLogDto): Promise<void> {
    try {
      const guild = await this.client.guilds.fetch(dto.guildId)

      const channel = await guild.channels.fetch(dto.channelId)

      if (!channel || !channel.isTextBased()) {
        return
      }

      const embed = createEmbed({
        title: dto.title,
        description: dto.description,
        fields: dto.fields,
        color: dto.color,
        timestamp: new Date()
      })

      await channel.send({ embeds: [embed], files: dto.attachments?.map(att => ({ attachment: att.url, name: att.name })) })
    } catch (error) {
      console.error('Failed to send Discord log:', error)
    }

  }

}
