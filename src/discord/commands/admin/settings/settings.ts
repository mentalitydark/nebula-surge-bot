import { createCommand } from "#base";
import { GuildSettingsKeys, Settings } from "#entities";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
  name: 'settings',
  description: 'Gerenciar configurações do bot',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: ["Administrator"],
  dmPermission: false,
  async autocomplete(interaction) {
    const inputFocused = interaction.options.getFocused(true)

    if (inputFocused.name !== 'setting') {
      return
    }

    return Object.values(GuildSettingsKeys).map((key) => {
      const description = Settings.getDescription(key)

      return {
        name: description,
        value: key,
      }
    })
  }
})