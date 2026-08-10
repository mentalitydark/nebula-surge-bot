import { ConsoleLoggerProvider } from "@/infrastructure/providers";
import { CommandInteraction } from "discord.js";
import { GuardFunction } from "discordx";

const logger = ConsoleLoggerProvider.create();

export const LoggerMiddleware: GuardFunction = async (arg, client, next) => {
  const isCommandInteraction = arg instanceof CommandInteraction;
  if (!isCommandInteraction) {
    await next();
    return;
  }

  logger.log(`Interaction received: ${arg.commandName}`);

  await next();
}