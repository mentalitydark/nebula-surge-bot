import { type Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { container } from 'tsyringe'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { type DiscordLogInterface, type LoggerInterface, type SendEmbedMessageInterface } from '@/application/contracts'
import { ApplyStrikeUseCase, SendAuditLogUseCase, SendEmbedMessageUseCase } from '@/application/use-cases'
import { ConsoleLoggerProvider, DiscordLogProvider, SendEmbedMessageProvider } from '@/infrastructure/providers'

import { TOKENS } from './tokens'

export function setupContainer(client: Client): void {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container)

  container.registerSingleton<LoggerInterface>(APPLICATION_TOKENS.LoggerInterface, ConsoleLoggerProvider)
  container.registerSingleton<DiscordLogInterface>(APPLICATION_TOKENS.DiscordLogInterface, DiscordLogProvider)
  container.registerSingleton<SendEmbedMessageInterface>(APPLICATION_TOKENS.SendEmbedMessageInterface, SendEmbedMessageProvider)

  container.registerSingleton<ApplyStrikeUseCase>(APPLICATION_TOKENS.ApplyStrikeUseCase, ApplyStrikeUseCase)
  container.registerSingleton<SendAuditLogUseCase>(APPLICATION_TOKENS.SendAuditLogUseCase, SendAuditLogUseCase)
  container.registerSingleton<SendEmbedMessageUseCase>(APPLICATION_TOKENS.SendEmbedMessageUseCase, SendEmbedMessageUseCase)

  container.registerInstance<Client>(TOKENS.DiscordClient, client)
}
