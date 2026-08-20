import { container } from "tsyringe";
import { GuardFunction } from "discordx";
import { TOKENS } from "@/infrastructure/container/tokens";
import { LoggerProviderInterface } from "@/application/providers";

export const OnErrorMiddleware: GuardFunction = async (_, __, next) => {
  try {
    await next();
  } catch (error) {
    const isError = error instanceof Error;

    const logger = container.resolve<LoggerProviderInterface>(TOKENS.LoggerProviderInterface);

    logger.error(isError ? error : String(error));
  }
}