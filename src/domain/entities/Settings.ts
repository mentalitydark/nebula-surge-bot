export enum GuildSettingsKeys {
  CHANNEL_MESSAGES_REMOVED = "channel_messages_removed",
  CHANNEL_AUTO_BAN = "channel_auto_ban",
  CHANNEL_LOGS = "channel_logs",
  CHANNEL_AUTO_BAN_VOTE = "channel_auto_ban_vote",
}

export class Settings {
  private values: Record<GuildSettingsKeys, string | null> = {
    [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN]: null,
    [GuildSettingsKeys.CHANNEL_LOGS]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: null,
  }

  public get(key: GuildSettingsKeys): string | null {
    return this.values[key]
  }

  public set(key: GuildSettingsKeys, value: string | null): Settings {
    this.values[key] = value

    return this
  }

  public static fromJSON(json: Record<string, any>): Settings {
    const settings = new Settings()

    settings
      .set(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, json[GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED] ?? null)
      .set(GuildSettingsKeys.CHANNEL_AUTO_BAN, json[GuildSettingsKeys.CHANNEL_AUTO_BAN] ?? null)
      .set(GuildSettingsKeys.CHANNEL_LOGS, json[GuildSettingsKeys.CHANNEL_LOGS] ?? null)
      .set(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE, json[GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE] ?? null)

    return settings
  }

  public toJSON(): Record<string, any> {
    return { ...this.values }
  }

  public static isValidKey(key: string): key is GuildSettingsKeys {
    return Object.values(GuildSettingsKeys).includes(key as GuildSettingsKeys)
  }

  public static getDescription(key: GuildSettingsKeys): string {
    switch (key) {
      case GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED:
        return "Canal onde as mensagens removidas serão enviadas"
      case GuildSettingsKeys.CHANNEL_AUTO_BAN:
        return "Canal onde mandar mensagem dá auto-ban"
      case GuildSettingsKeys.CHANNEL_LOGS:
        return "Canal onde os logs serão enviados"
      case GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE:
        return "Canal onde as votações de auto-ban serão enviadas"
      default:
        return ""
    }
  }
}