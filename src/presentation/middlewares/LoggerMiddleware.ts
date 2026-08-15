import { LogicException } from "@/domain/errors";
import { ConsoleLoggerProvider } from "@/infrastructure/providers";
import { ChatInputCommandInteraction, CommandInteractionOption } from "discord.js";
import { GuardFunction } from "discordx";

const logger = ConsoleLoggerProvider.create();

export const LoggerMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  const isCommand = interaction instanceof ChatInputCommandInteraction;

  if (!isCommand) {
    throw new LogicException();
  }

  const commandName = interaction.commandName;
  const parameters = parseOptions(interaction.options.data);
  const guildName = interaction.guild?.name ?? "DM";

  logger.info(
    `Usuário "${interaction.user.tag}" executou o comando "${commandName}" na guilda "${guildName}"`,
    `Parâmetros: ${JSON.stringify(parameters)}`
  );

  await next();
}

function parseOptions(options: readonly CommandInteractionOption[]): Record<string, any> {
  return options.reduce((acc, option) => {
    if (option.options && option.options.length > 0) {
      acc[option.name] = parseOptions(option.options);
    } else {
      acc[option.name] = option.value;
    }
    return acc;
  }, {} as Record<string, any>);
}