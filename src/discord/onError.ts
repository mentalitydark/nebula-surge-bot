import { AppError } from "#errors"
import { Logger } from "#functions"
import { createEmbed } from "@magicyan/discord"
import { CacheType, CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js"

export async function onError(error: any, interaction: CommandInteraction<CacheType> | (MessageComponentInteraction | ModalSubmitInteraction)) {
  const embed: Parameters<typeof createEmbed>['0'] = {
    title: 'Erro :(',
    description: 'Tivemos um erro inesperado! Por favor, tente novamente mais tarde.',
    color: constants.colors.danger,
  }

  if (error instanceof AppError) {
    embed.title = error.errorName
    embed.description = error.message
  } else {
    console.log(error)
  }

  Logger.error(String(embed.description))

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({
      embeds: [createEmbed(embed)]
    })
  } else {
    await interaction.reply({
      flags: ["Ephemeral"],
      embeds: [createEmbed(embed)]
    })
  }
}