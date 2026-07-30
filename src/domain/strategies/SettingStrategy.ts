import { GuildSettingsKeys, Settings } from "#entities";
import { Guild } from "discord.js";

export type SettingStrategyValue = string | string[] | number | number[] | null;

export interface SettingStrategy {
  key: GuildSettingsKeys;
  guild: Guild;

  /** @throws {Error} */
  validate(value: SettingStrategyValue): Promise<SettingStrategyValue>;
  apply(settings: Settings, value: SettingStrategyValue): Settings;
}