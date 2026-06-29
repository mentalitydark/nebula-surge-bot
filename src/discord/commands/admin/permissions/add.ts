import { CreateCommandPermissionUseCase } from "#application/use-cases/command-permission/CreateCommandPermissionUseCase.js";
import { registeredCommands } from "#base";
import { CommandPermissionTypeormRepository } from "#repositories";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType } from "discord.js";
import command from "./permissions.js";

command.subcommand({
  name: 'add',
  description: 'Adiciona permissões para um cargo executar um comando específico',
  options: [{
    name: 'role',
    description: 'Cargo que terá permissão',
    type: ApplicationCommandOptionType.Role,
    required: true
  }, {
    name: 'command',
    description: 'Comando que o cargo poderá executar',
    type: ApplicationCommandOptionType.String,
    required: true,
    autocomplete: true
  }],
  async run(interaction) {
    const { id: role } = interaction.options.getRole('role', true)
    const commandName = interaction.options.getString('command', true)
    const guild = interaction.guildId

    if (registeredCommands.has(commandName) === false) {
      await interaction.reply({
        flags: ['Ephemeral'],
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            description: brBuilder(
              '### Comando não registrado',
              `O comando \`${commandName}\` não está registrado no bot ou não precisa de permissões específicas.`
            )
          })
        ]
      })

      return
    }

    const repository = new CommandPermissionTypeormRepository()
    const createUseCase = new CreateCommandPermissionUseCase(repository)

    await createUseCase.execute({ role, command: commandName, guild })

    await interaction.reply({
      flags: ['Ephemeral'],
      embeds: [
        createEmbed({
          color: constants.colors.success,
          description: brBuilder(
            '### Permissão adicionada com sucesso!',
            `Cargo: <@&${role}>\nComando: \`${commandName}\``
          )
        })
      ]
    })
  }
})