import { ChatInputCommandInteraction } from 'discord.js'
import { type GuardFunction } from 'discordx'

import { LogicException, ForbiddenException } from '@/domain/errors'
import { isStaff } from '@/infrastructure/helpers'

export const StaffOnlyMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  const { guild } = interaction

  if (!(interaction instanceof ChatInputCommandInteraction)) {
    throw new LogicException()
  }

  if (!interaction.inGuild() || !guild) {
    throw new ForbiddenException()
  }

  const member = await guild.members.fetch(interaction.user.id)

  if (!isStaff(member)) {
    throw new ForbiddenException()
  }

  await next()
}
