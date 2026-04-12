import { BadRequestError, ConflictError, Forbidden, NotFoundError } from "#errors"
import { Logger } from "#functions"
import { createEmbed } from "@magicyan/discord"
import { CacheType, CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js"

export async function onError(error: any, interaction: CommandInteraction<CacheType>|(MessageComponentInteraction | ModalSubmitInteraction)) {
  const embed: Parameters<typeof createEmbed>['0'] = {
    title: 'Erro :(',
    description: 'Tivemos um erro inesperado! Por favor, tente novamente mais tarde.',
    color: constants.colors.danger,
  }

  if (ConflictError.isAppError(error)) {
    embed.title = 'Erro de conflito'
    embed.description = error.message
  } else if (NotFoundError.isAppError(error)) {
    embed.title = 'Recurso não encontrado'
    embed.description = error.message
  } else if (BadRequestError.isAppError(error)) {
    embed.title = 'Requisição inválida'
    embed.description = error.message
  } else if (Forbidden.isAppError(error)) {
    embed.title = 'Acesso negado'
    embed.description = error.message
  } else if (error instanceof Error) {
    embed.description = error.message
  } else {
    console.error(error)
  }

  Logger.error(String(embed.description))
  
  await interaction.reply({
    flags: ["Ephemeral"],
    embeds: [createEmbed(embed)]
  })
}