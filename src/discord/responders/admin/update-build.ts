import { createResponder } from "#base";
import { dataSource, entities } from "#database";
import { DiscordUtils, Logger } from "#functions";
import { ResponderType } from "@constatic/base";
import { TypeORMError } from "typeorm";

createResponder({
    customId: "/form/update-build/:buildId",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction, { buildId }) {
      const { fields } = interaction
      
      const equipament = fields.getTextInputValue("equipament")
      const content = fields.getTextInputValue("content")

      try {
        const repository = dataSource.getRepository(entities.Builds)
        const build = await repository.findOneBy({ id: Number(buildId) })

        if (!build) {
          throw new Error(`Build não encontrada.`)
        }

        repository.merge(build, { equipament, content })

        const saveResult = await repository.save(build)

        await interaction.reply({
          flags: ["Ephemeral"],
          content: `Build \`${saveResult.equipament}\` atualizada em ${DiscordUtils.formatTimestamp(saveResult.updatedAt ?? saveResult.createdAt)}`
        })
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint failed')) {
          throw new Error(`O equipamento \`${equipament}\` já existe.`)
        }

        if (error instanceof TypeORMError) {
          Logger.error(`Erro ao tentar alterar uma build: ${error.message}`)
        } else if (error instanceof Error) {
          Logger.error(`Erro inesperado em update-build: ${error.message}`)
        }

        throw new Error('Tivemos um erro inesperado. Por favor, tente novamente mais tarde.')
      }
    },
});