import { createEmbed } from '@magicyan/discord'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { type GuardFunction } from 'discordx'

import { Exception } from '@/domain/errors'
import { colors } from '@/presentation/constants'

export const OnErrorChatInputCommandInteractionMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  try {
    await next()
  } catch (error) {
    if (!(interaction instanceof ChatInputCommandInteraction)) {
      throw error
    }

    const isException = error instanceof Exception
    const errorEmbed = createEmbed({
      title: 'Erro',
      description: isException ? error.message : 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
      color: colors.danger
    })

    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [errorEmbed]
        })
      } else if (interaction.replied) {
        await interaction.followUp({
          flags: [MessageFlags.Ephemeral],
          embeds: [errorEmbed]
        })
      } else {
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          embeds: [errorEmbed]
        })
      }
    } catch (responseError) {
      console.error('Failed to send error response:', responseError)
      throw error
    }
  }
}
