import { SearchBuildsUseCase } from '#application/use-cases/build/SearchBuildsUseCase.js'
import { BuildModel } from '#entities'
import { GenerateButtonPrevNext } from '#functions'
import { BuildsTypeormRepository } from '#repositories'
import { brBuilder, createEmbed, createRow } from '@magicyan/discord'
import { ApplicationCommandOptionType, ButtonInteraction, ChatInputCommandInteraction, InteractionCollector } from 'discord.js'
import command from './build.js'

const PER_PAGE = 5;

command.subcommand({
  name: 'search',
  description: 'Pesquisa por builds feitas pelo clã Nebula Surge',
  options: [{
    name: 'title',
    description: 'Título da build',
    type: ApplicationCommandOptionType.String,
    required: false
  }],
  async run(interaction) {
    const { options } = interaction
    const title = options.getString("title", false) ?? ''
    const repository = new BuildsTypeormRepository()
    const searchBuildUseCase = new SearchBuildsUseCase(repository)

    let currentPage = 1;

    const searchResult = await searchBuildUseCase.execute({ filter: title, page: currentPage, per_page: PER_PAGE })

    if (searchResult.total === 0) {
      await noResult(interaction)
      return
    }

    const totalPages = Math.ceil(searchResult.total / PER_PAGE);

    const response = await interaction.reply({
      flags: ["Ephemeral"],
      withResponse: true,
      embeds: searchResult.data.map((build, index) => createEmbedBuild(build, index + 1, searchResult.total, currentPage)),
      components: [generateButtons(currentPage, totalPages)]
    })

    const collector = response.resource?.message?.createMessageComponentCollector({ time: 120_000 }) as InteractionCollector<ButtonInteraction<"cached">>

    collector.on('collect', async (i) => {
      if (i.customId === 'prev' && currentPage > 1) currentPage--;
      if (i.customId === 'next') currentPage++;

      const searchResult = await searchBuildUseCase.execute({ filter: title, page: currentPage, per_page: PER_PAGE })

      await i.update({
        embeds: searchResult.data.map((build, index) => createEmbedBuild(build, index + 1, searchResult.total, currentPage)),
        components: [generateButtons(currentPage, totalPages)]
      });
    });

    collector.on('end', async () => {
      await interaction.editReply({ components: [] }).catch(() => { });
    });
  }
})

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

async function noResult(interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString("title", false) ?? ''

  return interaction.reply({
    flags: ["Ephemeral"],
    embeds: [
      createEmbed({
        color: constants.colors.azoxo,
        description: brBuilder(
          '### Nenhuma build encontrada :(',
          `Título pesquisado: \`${title}\``
        )
      })
    ]
  })
}