import { brBuilder, createEmbed } from '@magicyan/discord'
import { roleMention } from 'discord.js'
import { inject, injectable } from 'tsyringe'

import type { SendEmbedMessageDTO, SendEmbedMessageInterface } from '@/application/contracts'
import type { Client } from 'discordx'


import { NotFoundException, InvalidArgumentException } from '@/domain/errors'
import { TOKENS } from '@/infrastructure/container/tokens'

@injectable()
export class SendEmbedMessageProvider implements SendEmbedMessageInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async send(data: SendEmbedMessageDTO): Promise<void> {
    const guild = await this.client.guilds.fetch(data.guildId)

    const channel = await guild.channels.fetch(data.channelId)

    if (!channel) { throw new NotFoundException(`Channel with ID ${data.channelId} not found`) }
    if (!channel.isTextBased()) { throw new InvalidArgumentException(`Channel with ID ${data.channelId} is not text-based`) }

    const roles = data.roleNotificationIds.map(roleMention)

    const description = brBuilder(
      `||${roles.join(' ')}||`,
      data.description ?? '',
    )

    const embed = createEmbed({
      description: description,
      color: data.embedColor,
      image: { url: data.attachmentUrl ?? '' }
    })

    await channel.send({ embeds: [embed] })
  }

}
