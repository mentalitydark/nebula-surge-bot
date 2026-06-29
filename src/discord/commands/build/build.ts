import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
  name: "build",
  description: "Gerencia as builds feitas pelo clã Nebula Surge",
  type: ApplicationCommandType.ChatInput
});