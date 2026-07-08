import { DeleteCommandPermissionUseCase } from "#application/use-cases/command-permission/DeleteCommandPermissionUseCase.js";
import { SearchCommandPermissionsUseCase } from "#application/use-cases/command-permission/SearchCommandPermissionsUseCase.js";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType } from "discord.js";
import command from "./permissions.js";

command.subcommand({
  name: 'remove',
  description: 'Remove permissões de um cargo para o comando específico',
  options: [
    {
      name: 'role',
      description: 'Cargo que terá a permissão removida',
      type: ApplicationCommandOptionType.Role,
      required: true
    },
    {
      name: 'command',
      description: 'Comando do qual remover a permissão',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ],
  async run(interaction) {
    const { id: role } = interaction.options.getRole('role', true)
    const commandName = interaction.options.getString('command', true)
    const guild = interaction.guildId

    const cache = InMemoryCacheProvider.getInstance('command-permissions:id')
    const cacheArray = InMemoryCacheProvider.getInstance('command-permissions:array')

    const repository = new CommandPermissionTypeormRepository()
    const searchUseCase = new SearchCommandPermissionsUseCase(repository)
    const deleteUseCase = new DeleteCommandPermissionUseCase(repository, cache, cacheArray)

    const searchResult = await searchUseCase.execute({
      guild,
      filter: { command: commandName, role }
    })

    if (searchResult.total === 0) {
      await interaction.reply({
        flags: ['Ephemeral'],
        embeds: [
          createEmbed({
            color: constants.colors.warning,
            description: brBuilder(
              '### Permissão não encontrada',
              `O cargo <@&${role}> não tem permissão para executar o comando \`${commandName}\``
            )
          })
        ]
      })
      return
    }

    await deleteUseCase.execute(searchResult.data[0].id)

    await interaction.reply({
      flags: ['Ephemeral'],
      embeds: [
        createEmbed({
          color: constants.colors.success,
          description: brBuilder(
            '### Permissão removida com sucesso!',
            `Cargo: <@&${role}>\nComando: \`${commandName}\``
          )
        })
      ]
    })
  },
})