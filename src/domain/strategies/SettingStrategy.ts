import { GuildSettingsKeys, Settings } from "#entities";
import { Guild } from "discord.js";

export interface SettingStrategy {
  key: GuildSettingsKeys;
  guild: Guild;

  /** @throws {Error} */
  validate(value: string | string[] | null): Promise<string | string[] | null>;
  apply(settings: Settings, value: string | string[] | null): Settings;
}