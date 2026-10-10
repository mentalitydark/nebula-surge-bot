import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js'
import { inject, injectable } from 'tsyringe'

import type { BanUserInterface } from '@/application/contracts'
import type { Client } from 'discordx'

import { type BanUserDto, TargetMemberInfoDto } from '@/application/dtos'
import { ForbiddenException } from '@/domain/errors'
import { TOKENS } from '@/infrastructure/container/tokens'
import { isBot, isStaff } from '@/infrastructure/helpers'

@injectable()
export class BanUserProvider implements BanUserInterface {

  public constructor(
    @inject(TOKENS.DiscordClient)
    private readonly client: Client
  ) { }

  public async ban(data: BanUserDto): Promise<void> {
    const guild = await this.client.guilds.fetch(data.guildId)

    try {
      await guild.bans.create(data.userId, {
        reason: data.reason,
        deleteMessageSeconds: data.deleteMessageSeconds
      })
    } catch (error: unknown) {
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) {
        throw new ForbiddenException('Usuário não encontrado')
      }

      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
        throw new ForbiddenException('Permissões insuficientes para banir o usuário')
      }

      throw error
    }
  }

  public async getMemberInfo(guildId: string, memberId: string): Promise<TargetMemberInfoDto | null> {
    const guild = await this.client.guilds.fetch(guildId)

    try {
      const member = await guild.members.fetch(memberId)
      return TargetMemberInfoDto.create({
        id: member.id,
        username: member.user.username,
        isStaff: isStaff(member),
        isBot: isBot(member)
      })
    } catch (error: unknown) {
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) {
        return null
      }

      throw error
    }
  }

}
