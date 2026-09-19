import { ChatInputCommandInteraction } from 'discord.js'
import { type GuardFunction } from 'discordx'

import { LogicException, ForbiddenException } from '@/domain/errors'
import { rolesId } from '@/infrastructure/config'

export const StaffOnlyMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  const { guild } = interaction

  if (!(interaction instanceof ChatInputCommandInteraction)) {
    throw new LogicException()
  }

  if (!interaction.inGuild() || !guild) {
    throw new ForbiddenException()
  }

  const member = await guild.members.fetch(interaction.user.id)

  const isStaff = member.roles.cache.some(role => role.id === rolesId.executor) || member.permissions.has('Administrator')

  if (!isStaff) {
    throw new ForbiddenException()
  }

  await next()
}
