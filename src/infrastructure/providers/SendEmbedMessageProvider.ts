import { brBuilder, createEmbed } from '@magicyan/discord'
import { roleMention } from 'discord.js'
import { inject, injectable } from 'tsyringe'

import type { SendEmbedMessageInterface } from '@/application/contracts'
import type { SendEmbedMessageDto } from '@/application/dtos'
import type { Client } from 'discordx'


import { NotFoundException, InvalidArgumentException } from '@/domain/errors'
import { TOKENS } from '@/infrastructure/container/tokens'

@injectable()
export class SendEmbedMessageProvider implements SendEmbedMessageInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async send(data: SendEmbedMessageDto): Promise<void> {
    const guild = await this.client.guilds.fetch(data.guildId)

    const channel = await guild.channels.fetch(data.channelId)

    if (!channel) { throw new NotFoundException(`Canal com ID ${data.channelId} não encontrado`) }
    if (!channel.isTextBased()) { throw new InvalidArgumentException(`Canal com ID ${data.channelId} não é baseado em texto`) }

    const roles = data.roleNotificationIds.map(roleMention)

    const description = brBuilder(
      `||${roles.join(' ')}||`,
      data.description ?? '',
    )

    const embed = createEmbed({
      description: description,
      color: data.embedColor.color,
      image: { url: data.attachment?.url ?? '' }
    })

    await channel.send({ embeds: [embed] })
  }

}
