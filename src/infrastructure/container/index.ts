import { type Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { container } from 'tsyringe'

import type { DiscordLogInterface, LoggerInterface, SendEmbedMessageInterface, BanUserInterface, BanAuditLogInterface } from '@/application/contracts'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { ApplyStrikeUseCase, BanUserUseCase, SendAuditLogUseCase, SendEmbedMessageUseCase } from '@/application/use-cases'
import { BanUserProvider, ConsoleLoggerProvider, DiscordLogProvider, SendEmbedMessageProvider, BanAuditLogProvider } from '@/infrastructure/providers'

import { TOKENS } from './tokens'

export function setupContainer(client: Client): void {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container)

  container.registerSingleton<LoggerInterface>(APPLICATION_TOKENS.LoggerInterface, ConsoleLoggerProvider)
  container.registerSingleton<DiscordLogInterface>(APPLICATION_TOKENS.DiscordLogInterface, DiscordLogProvider)
  container.registerSingleton<SendEmbedMessageInterface>(APPLICATION_TOKENS.SendEmbedMessageInterface, SendEmbedMessageProvider)
  container.registerSingleton<BanUserInterface>(APPLICATION_TOKENS.BanUserInterface, BanUserProvider)
  container.registerSingleton<BanAuditLogInterface>(APPLICATION_TOKENS.BanAuditLogInterface, BanAuditLogProvider)

  container.registerSingleton<ApplyStrikeUseCase>(APPLICATION_TOKENS.ApplyStrikeUseCase, ApplyStrikeUseCase)
  container.registerSingleton<SendAuditLogUseCase>(APPLICATION_TOKENS.SendAuditLogUseCase, SendAuditLogUseCase)
  container.registerSingleton<SendEmbedMessageUseCase>(APPLICATION_TOKENS.SendEmbedMessageUseCase, SendEmbedMessageUseCase)
  container.registerSingleton<BanUserUseCase>(APPLICATION_TOKENS.BanUserUseCase, BanUserUseCase)

  container.registerInstance<Client>(TOKENS.DiscordClient, client)
}
