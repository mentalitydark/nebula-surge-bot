import { APPLICATION_TOKENS } from "@/application/container/tokens";
import { LoggerProviderInterface } from "@/application/providers";
import { LogicException } from "@/domain/errors";
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

  const logger = container.resolve<LoggerProviderInterface>(APPLICATION_TOKENS.LoggerProviderInterface);

  logger.info(
    `Usuário "${interaction.user.tag}" executou o comando "${commandName}" na guilda "${guildName}"`,
    `Parâmetros: ${JSON.stringify(parameters)}`
  );

  await next();
}

function parseOptions(options: readonly CommandInteractionOption[]): Record<string, unknown> {
  return options.reduce<Record<string, unknown>>((acc, option) => {
    if (option.options && option.options.length > 0) {
      acc[option.name] = parseOptions(option.options);
    } else {
      acc[option.name] = option.value;
    }
    return acc;
  }, {});
}