import { createResponder } from "#base";
import { dataSource, entities } from "#database";
import { DiscordUtils, Logger } from "#functions";
import { ResponderType } from "@constatic/base";
import { TypeORMError } from "typeorm";

createResponder({
    customId: "/form/add-build",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
      const { fields } = interaction
      
      const equipament = fields.getTextInputValue("equipament")
      const content = fields.getTextInputValue("content")
      try {
        const repository = dataSource.getRepository(entities.Builds)

        const build = repository.create({ equipament, content })

        const saveResult = await repository.save(build)

        await interaction.reply({
          flags: ["Ephemeral"],
          content: `Build \`${saveResult.equipament}\` criada em ${DiscordUtils.formatTimestamp(saveResult.createdAt)}`
        })
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint failed')) {
          throw new Error(`O equipamento \`${equipament}\` já existe.`)
        }

        if (error instanceof TypeORMError) {
          Logger.error(`Erro ao tentar salvar uma build: ${error.message}`)
        } else if (error instanceof Error) {
          Logger.error(`Erro inesperado em add-build: ${error.message}`)
        }

        throw new Error('Tivemos um erro inesperado. Por favor, tente novamente mais tarde.')
      }
    },
});