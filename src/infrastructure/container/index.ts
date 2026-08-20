import { container } from "tsyringe";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { TOKENS } from "./tokens";
import { ApplyStrikeUseCase, SendAuditLogUseCase } from "@/application/use-cases";
import { ConsoleLoggerProvider, DiscordLogProvider } from "@/infrastructure/providers";
import { DiscordLogProviderInterface, LoggerProviderInterface } from "@/application/providers";
import { APPLICATION_TOKENS } from "@/application/container/tokens";

export function setupContainer(client: Client): void {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

  container.registerSingleton<LoggerProviderInterface>(APPLICATION_TOKENS.LoggerProviderInterface, ConsoleLoggerProvider);
  container.registerSingleton<DiscordLogProviderInterface>(APPLICATION_TOKENS.DiscordLogProviderInterface, DiscordLogProvider);

  container.registerSingleton<ApplyStrikeUseCase>(APPLICATION_TOKENS.ApplyStrikeUseCase, ApplyStrikeUseCase);
  container.registerSingleton<SendAuditLogUseCase>(APPLICATION_TOKENS.SendAuditLogUseCase, SendAuditLogUseCase);

  container.registerInstance<Client>(TOKENS.DiscordClient, client);
}