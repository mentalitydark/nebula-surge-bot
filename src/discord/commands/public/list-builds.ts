import { createCommand } from "#base";
import { BuildModel } from "#entities";
import { GenerateButtonPrevNext } from "#functions";
import { BuildsTypeormRepository } from "#repositories";
import { createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonInteraction, InteractionCollector } from "discord.js";
import { BuildsRepositoryInterface } from "../../../application/repositories/BuildsRepositoryInterface.js";

const PER_PAGE = 5;

createCommand({
    name: "list-builds",
    description: "Liste todas builds feitas pelo clã Nebula Surge",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const repository = new BuildsTypeormRepository()

        let currentPage = 1;

        const searchResult = await search(repository, currentPage)

        if (searchResult.total === 0) {
          await interaction.reply({
            flags: ["Ephemeral"],
            embeds: [
              createEmbed({
                color: constants.colors.azoxo,
                description: "### Nenhuma build cadastrada :("
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

          const searchResult = await search(repository, currentPage)

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

async function search(repository: BuildsRepositoryInterface, page: number) {
  return await repository.search({ page, per_page: PER_PAGE })
}