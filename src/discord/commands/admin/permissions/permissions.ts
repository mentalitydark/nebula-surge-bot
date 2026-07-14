import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
  name: "permissions",
  description: "Gerencia quais comandos estão habilitados para cada cargo",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: ["Administrator"],
  dmPermission: false
});