export enum GuildSettingsKeys {
  CHANNEL_MESSAGES_REMOVED = "channel_messages_removed"
}

export class Settings {
  private values: Record<GuildSettingsKeys, string | undefined> = {} as Record<GuildSettingsKeys, string | undefined>

  public get(key: GuildSettingsKeys): string | undefined {
    return this.values[key]
  }

  public set(key: GuildSettingsKeys, value: string): Settings {
    this.values[key] = value

    return this
  }

  public static fromJSON(json: Record<string, any>): Settings {
    const settings = new Settings()

    settings.set(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, json[GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED])

    return settings
  }

  public toJSON(): Record<string, any> {
    return this.values
  }

  public static isValidKey(key: string): key is GuildSettingsKeys {
    return Object.values(GuildSettingsKeys).includes(key as GuildSettingsKeys)
  }

  public static getDescription(key: GuildSettingsKeys): string {
    switch (key) {
      case GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED:
        return "Canal onde as mensagens removidas serão enviadas"
      default:
        return ""
    }
  }
}