import { createEmbed } from '@magicyan/discord'
import { MessageFlags, ModalSubmitInteraction } from 'discord.js'
import { type GuardFunction } from 'discordx'

import { Exception } from '@/domain/errors'
import { colors } from '@/presentation/constants'

export const OnErrorModalSubmitMiddleware: GuardFunction<ModalSubmitInteraction> = async (interaction, _, next) => {
  try {
    await next()
  } catch (error) {
    if (!(interaction instanceof ModalSubmitInteraction)) {
      throw error
    }

    const isException = error instanceof Exception
    const errorEmbed = createEmbed({
      title: 'Erro',
      description: isException ? error.message : 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
      color: colors.danger,
    })

    try {
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] })
      } else if (interaction.replied) {
        await interaction.followUp({ flags: [MessageFlags.Ephemeral], embeds: [errorEmbed] })
      } else {
        await interaction.reply({ flags: [MessageFlags.Ephemeral], embeds: [errorEmbed] })
      }
    } catch {
      console.error('Failed to send modal error response:', error)
      throw error
    }
  }
}
