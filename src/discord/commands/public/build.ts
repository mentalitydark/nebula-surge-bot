import { createCommand } from "#base";
import { BuildsTypeormRepository } from "#repositories";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

createCommand({
    name: "build",
    description: "Pesquise por builds de equipamentos (warframe, armas, companheiro, etc)",
    type: ApplicationCommandType.ChatInput,
    options: [{
      name: "equipamento",
      description: "Equipamento que a ser pesquisado",
      type: ApplicationCommandOptionType.String,
      required: true
    }],
    async run(interaction) {
        const { options } = interaction

        const equipament = options.getString("equipamento", true)

        const repository =  new BuildsTypeormRepository()

        const result = await repository.search({ filter: equipament })

        if (result.total === 0) {
          await interaction.reply({
            flags: ["Ephemeral"],
            embeds: [
              createEmbed({
                color: constants.colors.azoxo,
                description: brBuilder(
                  '### Nenhuma build encontrada :(',
                  `Equipamento pesquisado: \`${equipament}\``
                )
              })
            ]
          })

          return
        }

        await interaction.reply({
          flags: ["Ephemeral"],
          embeds: result.data.slice(0, 10).map((build, index) => createEmbed({
            color: constants.colors.primary,
            description: brBuilder(
              `### Build \`${build.equipament}\``,
              build.content
            ),
            footer: `Build ${index + 1} de ${result.total}`,
            timestamp: build.updatedAt ?? build.createdAt
          }))
        })
    }
});