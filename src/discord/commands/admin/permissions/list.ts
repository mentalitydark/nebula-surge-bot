import { SearchCommandPermissionsUseCase } from "#application/use-cases/command-permission/SearchCommandPermissionsUseCase.js";
import { registeredCommands } from "#base";
import { CommandPermissionModel } from "#entities";
import { GenerateButtonPrevNext } from "#functions";
import { CommandPermissionTypeormRepository } from "#repositories";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ButtonInteraction, ChatInputCommandInteraction, InteractionCollector } from "discord.js";
import command from "./permissions.js";

const PER_PAGE = 10;

command.subcommand({
  name: 'list',
  description: 'Lista todas as permissões configuradas',
  options: [{
    name: 'command',
    description: 'Filtrar por comando específico',
    type: ApplicationCommandOptionType.String,
    required: false,
    choices: Array.from(registeredCommands.entries()).map(([key, value]) => ({
      name: value,
      value: key
    }))
  }],
  async run(interaction) {
    const { options } = interaction
    const commandFilter = options.getString("command", false)
    const guild = interaction.guildId

    const repository = new CommandPermissionTypeormRepository()
    const searchUseCase = new SearchCommandPermissionsUseCase(repository)

    let currentPage = 1;

    const searchResult = await searchUseCase.execute({
      guild,
      filter: commandFilter ? { command: commandFilter } : undefined,
      page: currentPage,
      per_page: PER_PAGE
    })

    if (searchResult.total === 0) {
      await noResult(interaction, commandFilter)
      return
    }

    const totalPages = Math.ceil(searchResult.total / PER_PAGE);

    const response = await interaction.reply({
      flags: ["Ephemeral"],
      withResponse: true,
      embeds: [createEmbedList(searchResult.data, searchResult.total, currentPage, totalPages, commandFilter)],
      components: totalPages > 1 ? [generateButtons(currentPage, totalPages)] : []
    })

    if (totalPages <= 1) return

    const collector = response.resource?.message?.createMessageComponentCollector({ time: 120_000 }) as InteractionCollector<ButtonInteraction<"cached">>

    collector.on('collect', async (i) => {
      if (i.customId === 'prev' && currentPage > 1) currentPage--;
      if (i.customId === 'next') currentPage++;

      const searchResult = await searchUseCase.execute({
        guild,
        filter: commandFilter ? { command: commandFilter } : undefined,
        page: currentPage,
        per_page: PER_PAGE
      })

      await i.update({
        embeds: [createEmbedList(searchResult.data, searchResult.total, currentPage, totalPages, commandFilter)],
        components: [generateButtons(currentPage, totalPages)]
      });
    });

    collector.on('end', async () => {
      await interaction.editReply({ components: [] }).catch(() => { });
    });
  }
})

function createEmbedList(permissions: CommandPermissionModel[], total: number, currentPage: number, totalPages: number, commandFilter: string | null) {
  const startIndex = (currentPage - 1) * PER_PAGE;

  const permissionsList = permissions.map((p, index) => {
    return `**${startIndex + index + 1}.** Comando: \`${p.command}\` → Cargo: <@&${p.role}>`
  }).join('\n')

  return createEmbed({
    color: constants.colors.primary,
    title: 'Lista de Permissões',
    description: brBuilder(
      commandFilter ? `**Filtro:** \`${commandFilter}\`\n` : '',
      permissionsList,
    ),
    footer: `Página ${currentPage} de ${totalPages} | Total: ${total} permissões`
  })
}

function generateButtons(currentPage: number, totalPages: number) {
  return createRow(GenerateButtonPrevNext(currentPage <= 1, currentPage >= totalPages));
}

async function noResult(interaction: ChatInputCommandInteraction, commandFilter: string | null) {
  return interaction.reply({
    flags: ["Ephemeral"],
    embeds: [
      createEmbed({
        color: constants.colors.warning,
        description: brBuilder(
          '### Nenhuma permissão encontrada',
          commandFilter ? `Comando pesquisado: \`${commandFilter}\`` : 'Nenhuma permissão configurada para esta guild.'
        )
      })
    ]
  })
}
