export interface AuditLogDTO {
  guildId: string;
  channelId: string;
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  color?: string;
}

export interface DiscordLogProviderInterface {
  sendLog(dto: AuditLogDTO): Promise<void>;
}
