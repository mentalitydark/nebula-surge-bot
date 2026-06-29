import { createCommand, registeredCommands } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
    name: "permissions",
    description: "Gerencia quais comandos estão habilitados para cada cargo",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    dmPermission: false,
    async autocomplete(interaction) {
      const inputFocused = interaction.options.getFocused(true)
      if (inputFocused.name !== 'command') return

      const commandName = interaction.options.getString('command', true)

      const commands = Array.from(registeredCommands.values())
      const commandsFiltered = commands.filter(command => command.includes(commandName))
      
      return commandsFiltered.map(command => ({
        name: command,
        value: command
      }))
    }
});