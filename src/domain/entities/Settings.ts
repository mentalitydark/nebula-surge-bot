export enum GuildSettingsKeys {
  CHANNEL_MESSAGES_REMOVED = "channel_messages_removed",
  CHANNEL_AUTO_BAN = "channel_auto_ban",
  CHANNEL_LOGS = "channel_logs",
  CHANNEL_AUTO_BAN_VOTE = "channel_auto_ban_vote",
  ROLE_AUTO_BAN = "role_auto_ban",
  AUTO_BAN_VOTE_THRESHOLD = "auto_ban_vote_threshold",
}

export type GuildSettingsValueMap = {
  [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: string | null
  [GuildSettingsKeys.CHANNEL_AUTO_BAN]: string[] | null
  [GuildSettingsKeys.CHANNEL_LOGS]: string | null
  [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: string | null
  [GuildSettingsKeys.ROLE_AUTO_BAN]: string | null
  [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: number | null
}

export class Settings {
  private values: GuildSettingsValueMap = {
    [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN]: null,
    [GuildSettingsKeys.CHANNEL_LOGS]: null,
    [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: null,
    [GuildSettingsKeys.ROLE_AUTO_BAN]: null,
    [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: null,
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
      .set(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, this.transformToStringOrNull(json[GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]))
      .set(GuildSettingsKeys.CHANNEL_AUTO_BAN, this.transformToArrayOrNull(json[GuildSettingsKeys.CHANNEL_AUTO_BAN]))
      .set(GuildSettingsKeys.CHANNEL_LOGS, this.transformToStringOrNull(json[GuildSettingsKeys.CHANNEL_LOGS]))
      .set(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE, this.transformToStringOrNull(json[GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]))
      .set(GuildSettingsKeys.ROLE_AUTO_BAN, this.transformToStringOrNull(json[GuildSettingsKeys.ROLE_AUTO_BAN]))
      .set(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD, this.transformToNumberOrNull(json[GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]))

    return settings
  }

  public toJSON(): Record<string, string | string[] | number | null> {
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
      case GuildSettingsKeys.ROLE_AUTO_BAN:
        return "Cargo atribuído aos usuários banidos automaticamente"
      case GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD:
        return "Número mínimo de votos necessários para um auto-ban"
      default:
        return ""
    }
  }

  private static transformToArrayOrNull(value: string | string[] | null): string[] | null {
    if (value === null || value === undefined) {
      return null
    }

    if (Array.isArray(value)) {
      return value
    }

    return [value]
  }

  private static transformToStringOrNull(value: string | string[] | null): string | null {
    if (value === null || value === undefined) {
      return null
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : null
    }

    return value
  }

  private static transformToNumberOrNull(value: number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null
    }

    const numeric = typeof value === 'number' ? value : Number(value)

    return Number.isFinite(numeric) ? numeric : null
  }
}