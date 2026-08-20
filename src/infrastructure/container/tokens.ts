export const TOKENS = {
  DiscordClient: Symbol.for("DiscordClient"),
  LoggerProviderInterface: Symbol.for("LoggerProviderInterface"),
  DiscordLogProviderInterface: Symbol.for("DiscordLogProviderInterface"),
  ApplyStrikeUseCase: Symbol.for("ApplyStrikeUseCase"),
  SendAuditLogUseCase: Symbol.for("SendAuditLogUseCase")
} as const;