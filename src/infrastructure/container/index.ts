import { type Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { container } from 'tsyringe'


import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { type DiscordLogProviderInterface, type LoggerProviderInterface } from '@/application/providers'
import { ApplyStrikeUseCase, SendAuditLogUseCase } from '@/application/use-cases'
import { ConsoleLoggerProvider, DiscordLogProvider } from '@/infrastructure/providers'

import { TOKENS } from './tokens'

export function setupContainer(client: Client): void {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container)

  container.registerSingleton<LoggerProviderInterface>(APPLICATION_TOKENS.LoggerProviderInterface, ConsoleLoggerProvider)
  container.registerSingleton<DiscordLogProviderInterface>(APPLICATION_TOKENS.DiscordLogProviderInterface, DiscordLogProvider)

  container.registerSingleton<ApplyStrikeUseCase>(APPLICATION_TOKENS.ApplyStrikeUseCase, ApplyStrikeUseCase)
  container.registerSingleton<SendAuditLogUseCase>(APPLICATION_TOKENS.SendAuditLogUseCase, SendAuditLogUseCase)

  container.registerInstance<Client>(TOKENS.DiscordClient, client)
}
