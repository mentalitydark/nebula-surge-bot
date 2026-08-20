import { container } from "tsyringe";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { TOKENS } from "./tokens";
import { ApplyStrikeUseCase, SendAuditLogUseCase } from "@/application/use-cases";
import { ConsoleLoggerProvider, DiscordLogProvider } from "@/infrastructure/providers";
import { DiscordLogProviderInterface, LoggerProviderInterface } from "@/application/providers";

export function setupContainer(client: Client): void {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

  container.registerSingleton<LoggerProviderInterface>(TOKENS.LoggerProviderInterface, ConsoleLoggerProvider);
  container.registerSingleton<DiscordLogProviderInterface>(TOKENS.DiscordLogProviderInterface, DiscordLogProvider);

  container.registerSingleton<ApplyStrikeUseCase>(TOKENS.ApplyStrikeUseCase, ApplyStrikeUseCase);
  container.registerSingleton<SendAuditLogUseCase>(TOKENS.SendAuditLogUseCase, SendAuditLogUseCase);

  container.registerInstance<Client>(TOKENS.DiscordClient, client);
}