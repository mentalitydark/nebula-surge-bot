import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
  name: 'settings',
  description: 'Gerenciar configurações do bot',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: ["Administrator"],
  dmPermission: false
})