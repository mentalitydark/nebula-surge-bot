import { setupCreators } from "@constatic/base";
import { createEmbed } from "@magicyan/discord";

const setup = setupCreators({
  commands: {
    async onError(error: any, interaction) {
      await interaction.reply({
        flags: ["Ephemeral"],
        embeds: [
          createEmbed({
            description: error?.message || 'Tivemos um erro inesperado. Por favor, tente novamente mais tarde.',
            color: constants.colors.danger
          })
        ]
      })
    }
  },
  responders: {
    async onError(error: any, interaction) {
      await interaction.reply({
        flags: ["Ephemeral"],
        embeds: [
          createEmbed({
            description: error?.message || 'Tivemos um erro inesperado. Por favor, tente novamente mais tarde.',
            color: constants.colors.danger
          })
        ]
      })
    }
  }
})

export const { createCommand, createEvent, createResponder } = setup;