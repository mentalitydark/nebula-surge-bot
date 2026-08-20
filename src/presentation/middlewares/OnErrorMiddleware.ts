import { container } from "tsyringe";
import { GuardFunction } from "discordx";
import { LoggerProviderInterface } from "@/application/providers";
import { APPLICATION_TOKENS } from "@/application/container/tokens";

export const OnErrorMiddleware: GuardFunction = async (_, __, next) => {
  try {
    await next();
  } catch (error) {
    try {
      const isError = error instanceof Error;

      const logger = container.resolve<LoggerProviderInterface>(APPLICATION_TOKENS.LoggerProviderInterface);

      logger.error(isError ? error : String(error));
    } catch {
      console.error("Failed to log error:", error);
    }
  }
}