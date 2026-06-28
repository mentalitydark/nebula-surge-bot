import { DeleteCommandPermissionUseCase } from "#application/use-cases/command-permission/DeleteCommandPermissionUseCase.js";
import { SearchCommandPermissionsUseCase } from "#application/use-cases/command-permission/SearchCommandPermissionsUseCase.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { createEmbed } from "@magicyan/discord";
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

    const repository = new CommandPermissionTypeormRepository()
    const searchUseCase = new SearchCommandPermissionsUseCase(repository)
    const deleteUseCase = new DeleteCommandPermissionUseCase(repository)

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
            description: `Permissão não encontrada!\n\nO cargo <@&${role}> não tem permissão para executar o comando \`${commandName}\``
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
          description: `Permissão removida com sucesso!\n\nCargo: <@&${role}>\nComando: \`${commandName}\``
        })
      ]
    })
  },
})