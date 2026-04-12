import { createCommand } from "#base";
import { BuildModel } from "#entities";
import { GenerateButtonPrevNext } from "#functions";
import { BuildsTypeormRepository } from "#repositories";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonInteraction, InteractionCollector } from "discord.js";
import { BuildsRepositoryInterface } from "../../../application/repositories/BuildsRepositoryInterface.js";

const PER_PAGE = 5;

createCommand({
    name: "build",
    description: "Pesquise por builds de equipamentos feitas pelo clã Nebula Surge",
    type: ApplicationCommandType.ChatInput,
    options: [{
      name: "equipamento",
      description: "Equipamento que a ser pesquisado",
      type: ApplicationCommandOptionType.String,
      required: true
    }],
    async run(interaction) {
        const { options } = interaction
        const repository = new BuildsTypeormRepository()
        const equipament = options.getString("equipamento", true)
        
        let currentPage = 1;

        const searchResult = await search(repository, equipament, currentPage)

        if (searchResult.total === 0) {
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

        const totalPages = Math.ceil(searchResult.total / PER_PAGE);

        const response = await interaction.reply({
          flags: ["Ephemeral"],
          withResponse: true,
          embeds: searchResult.data.map((build, index) => createEmbedBuild(build, index+1, searchResult.total, currentPage)),
          components: [generateButtons(currentPage, totalPages)]
        })

        const collector = response.resource?.message?.createMessageComponentCollector({ time: 120_000 }) as InteractionCollector<ButtonInteraction<"cached">>

        collector.on('collect', async (i) => {
          if (i.customId === 'prev' && currentPage > 1) currentPage--;
          if (i.customId === 'next') currentPage++;

          const searchResult = await search(repository, equipament, currentPage)

          await i.update({
            embeds: searchResult.data.map((build, index) => createEmbedBuild(build, index+1, searchResult.total, currentPage)),
            components: [generateButtons(currentPage, totalPages)]
          });
        });

        collector.on('end', async () => {
          await interaction.editReply({ components: [] }).catch(() => {});
        });
    }
});

function createEmbedBuild(build: BuildModel, index: number, total: number, currentPage: number) {
  return createEmbed({
    color: constants.colors.primary,
    title: build.equipament,
    description: build.content,
    footer: `Build ${(currentPage - 1) * PER_PAGE + index} de ${total}`,
    timestamp: build.updatedAt ?? build.createdAt
  })
}

function generateButtons(currentPage: number, totalPages: number) {
  return createRow(GenerateButtonPrevNext(currentPage <= 1, currentPage >= totalPages));
}

async function search(repository: BuildsRepositoryInterface, equipament: string, page: number) {
  return await repository.search({ filter: equipament, page, per_page: PER_PAGE })
}