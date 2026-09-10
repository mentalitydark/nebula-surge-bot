export const APPLICATION_TOKENS = {
  ApplyStrikeUseCase: Symbol.for('ApplyStrikeUseCase'),
  SendAuditLogUseCase: Symbol.for('SendAuditLogUseCase'),
  SendEmbedMessageUseCase: Symbol.for('SendEmbedMessageUseCase'),

  LoggerInterface: Symbol.for('LoggerInterface'),
  DiscordLogInterface: Symbol.for('DiscordLogInterface'),
  SendEmbedMessageProviderInterface: Symbol.for('SendEmbedMessageProviderInterface')
} as const
