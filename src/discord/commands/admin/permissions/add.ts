import { CommandPermissionTypeormRepository } from "#repositories";
import { ApplicationCommandOptionType } from "discord.js";
import command from "./permissions.js";

command.subcommand({
  name: 'add',
  description: 'Adiciona permissões para um cargo executar um comando específico',
  options: [{
    name: 'role',
    type: ApplicationCommandOptionType.Role,
    required: true
  },{
    name: 'command',
    type: ApplicationCommandOptionType.String,
    required: true,
    autocomplete: true
  }],
  async run(interaction) {
    const { id: role } = interaction.options.getRole('role', true)
    const command = interaction.options.getString('command', true)
    const guild = interaction.guildId

    const repository = new CommandPermissionTypeormRepository()

    const commandPermission = repository.create({ role, command, guild })

    await repository.conflictingPermission(command, role, guild)

    await repository.insert(commandPermission)

    await interaction.reply({
      flags: ['Ephemeral', 'SuppressEmbeds'],
      content: `Adicionado permissões para o cargo <@&${role}> para executar o comando \`${command}\``
    })
  }
})