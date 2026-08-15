import { ConsoleLoggerProvider } from "@/infrastructure/providers";
import { GuardFunction } from "discordx";

const logger = new ConsoleLoggerProvider(console);

export const OnErrorMiddleware: GuardFunction = async (_, __, next) => {
  try {
    await next();
  } catch (error) {
    const isError = error instanceof Error;
    logger.error(isError ? error : String(error));
  }
}