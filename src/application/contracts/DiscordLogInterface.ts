export interface AuditLogDTO {
  guildId: string;
  channelId: string;
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  color?: string;
}

export interface DiscordLogInterface {
  sendLog(dto: AuditLogDTO): Promise<void>;
}
