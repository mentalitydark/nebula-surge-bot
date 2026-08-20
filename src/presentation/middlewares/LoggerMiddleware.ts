import { LoggerProviderInterface } from "@/application/providers";
import { LogicException } from "@/domain/errors";
import { TOKENS } from "@/infrastructure/container/tokens";
import { ChatInputCommandInteraction, CommandInteractionOption } from "discord.js";
import { GuardFunction } from "discordx";
import { container } from "tsyringe";

export const LoggerMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  const isCommand = interaction instanceof ChatInputCommandInteraction;

  if (!isCommand) {
    throw new LogicException();
  }

  const commandName = interaction.commandName;
  const parameters = parseOptions(interaction.options.data);
  const guildName = interaction.guild?.name ?? "DM";

  const logger = container.resolve<LoggerProviderInterface>(TOKENS.LoggerProviderInterface);

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