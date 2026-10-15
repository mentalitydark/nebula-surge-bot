export const APPLICATION_TOKENS = {
  ApplyStrikeUseCase: Symbol.for('ApplyStrikeUseCase'),
  SendAuditLogUseCase: Symbol.for('SendAuditLogUseCase'),
  SendEmbedMessageUseCase: Symbol.for('SendEmbedMessageUseCase'),
  BanUserUseCase: Symbol.for('BanUserUseCase'),

  LoggerInterface: Symbol.for('LoggerInterface'),
  DiscordLogInterface: Symbol.for('DiscordLogInterface'),
  SendEmbedMessageInterface: Symbol.for('SendEmbedMessageInterface'),
  BanUserInterface: Symbol.for('BanUserInterface'),
  BanAuditLogInterface: Symbol.for('BanAuditLogInterface'),
} as const
