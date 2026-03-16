import { createCommand } from "#base";
import { dataSource, entities } from "#database";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

createCommand({
    name: "remove-build",
    description: "Selecione uma build para remover",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
      {
        name: "equipamento",
        description: "Warframe, arma ou companheiro...",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    async run(interaction) {
      const { options } = interaction

      const equipament = options.getString("equipamento", true)

      const repository = dataSource.getRepository(entities.Builds)

      const build = await repository.findOneBy({ equipament })

      if (!build) {
        throw new Error(`Build \`${equipament}\` não encontrada.`)
      }

      await repository.remove(build)

      await interaction.reply({
        flags: ["Ephemeral"],
        content: `Build \`${build.equipament}\` removida.`
      })
    }
});