export enum GuildSettingsKeys {
  CHANNEL_MESSAGES_REMOVED = "channel_messages_removed",
  CHANNEL_AUTO_BAN = "channel_auto_ban",
  CHANNEL_LOGS = "channel_logs",
  CHANNEL_AUTO_BAN_VOTE = "channel_auto_ban_vote",
}

export type GuildSettingsValueMap = {
  [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: string | null
  [GuildSettingsKeys.CHANNEL_AUTO_BAN]: string[] | null
  [GuildSettingsKeys.CHANNEL_LOGS]: string | null
  [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: string | null
}

export class Settings {
  private values: GuildSettingsValueMap = {
    [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN]: null,
    [GuildSettingsKeys.CHANNEL_LOGS]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: null,
  }

  public get<K extends GuildSettingsKeys>(key: K): GuildSettingsValueMap[K]
  public get<K extends GuildSettingsKeys>(key: K[]): GuildSettingsValueMap[K][]
  public get<K extends GuildSettingsKeys>(key: K | K[]): GuildSettingsValueMap[K] | GuildSettingsValueMap[K][] {
    if (Array.isArray(key)) {
      return key.map(k => this.values[k]) as GuildSettingsValueMap[K][]
    }

    return this.values[key]
  }

  public set<K extends GuildSettingsKeys>(key: K, value: GuildSettingsValueMap[K]): Settings {
    this.values[key] = value

    return this
  }

  public has(key: GuildSettingsKeys): boolean {
    return this.values[key] !== null && this.values[key] !== undefined
  }

  public delete(key: GuildSettingsKeys): Settings {
    this.values[key] = null

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

  public toJSON(): Record<string, string | string[] | null> {
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
        return "Canais onde mandar mensagem irá resultar em auto-ban"
      case GuildSettingsKeys.CHANNEL_LOGS:
        return "Canal onde serão enviados os logs do servidor"
      case GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE:
        return "Canal onde as votações de auto-ban serão enviadas"
      default:
        return ""
    }
  }
}