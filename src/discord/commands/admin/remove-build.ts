import { createCommand } from "#base";
import { BuildsTypeormRepository } from "#repositories";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

createCommand({
    name: "remove-build",
    description: "Remove uma build a partir do seu identificador",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
      {
        name: "identificador",
        description: "Identificador dado para a build",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    async run(interaction) {
      const { options } = interaction

      const equipament = options.getString("equipamento", true)

      const repository = new BuildsTypeormRepository()

      await repository.deleteByEquipament(equipament)

      await interaction.reply({
        flags: ["Ephemeral"],
        content: `Build \`${equipament}\` removida.`
      })
    }
});