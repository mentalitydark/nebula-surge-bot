import { createCommand } from "#base";
import { dataSource, entities } from "#database";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { ILike } from "typeorm";

createCommand({
    name: "build",
    description: "Pesquise uma build de um Warframe, arma ou companheiro...",
    type: ApplicationCommandType.ChatInput,
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

        const [builds, count] = await repository.findAndCount({
          where: {
            equipament: ILike(`%${equipament}%`)
          }
        })

        if (!builds.length) {
          await interaction.reply({
            flags: ["Ephemeral"],
            embeds: [
              createEmbed({
                color: constants.colors.warning,
                description: brBuilder(
                  '### Nenhum build encontrada :(',
                  `Equipamento pesquisado: \`${equipament}\``
                )
              })
            ]
          })

          return
        }

        await interaction.reply({
          flags: ["Ephemeral"],
          embeds: builds.slice(0, 10).map((build, index) => createEmbed({
            color: constants.colors.primary,
            description: brBuilder(
              `### Build \`${build.equipament}\``,
              build.content
            ),
            footer: `Build ${index + 1} de ${count}`,
            timestamp: build.updatedAt ?? build.createdAt
          }))
        })
    }
});