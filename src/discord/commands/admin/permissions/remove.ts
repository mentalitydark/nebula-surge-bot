import { ApplicationCommandOptionType } from "discord.js";
import command from "./permissions.js";

command.subcommand({
  name: 'remove',
  description: 'Remove permissões de um cargo para o comando específico',
  options: [
    {
      name: 'role',
      type: ApplicationCommandOptionType.Role,
      required: true
    },
    {
      name: 'command',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  async run(interaction) {
    await interaction.reply({
      flags: ['Ephemeral'],
      content: 'Em desenvolvimento...'
    })
  },
})