import { inject, injectable } from 'tsyringe'

import type { BanUserInterface } from '@/application/contracts'
import type { BanUserDto } from '@/application/dtos'
import type { Client } from 'discordx'

import { TOKENS } from '@/infrastructure/container/tokens'

@injectable()
export class BanUserProvider implements BanUserInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async ban(data: BanUserDto): Promise<void> {
    const guild = await this.client.guilds.fetch(data.guildId)

    const member = await guild.members.fetch(data.userId)

    await member.ban({ reason: data.reason, deleteMessageSeconds: data.deleteMessageSeconds })
  }

}
