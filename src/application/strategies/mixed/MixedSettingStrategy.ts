import { SettingStrategy, SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, Settings } from "#entities";
import { Guild } from "discord.js";

export abstract class MixedSettingStrategy implements SettingStrategy {
  abstract readonly key: GuildSettingsKeys;
  abstract readonly allowMultiple: boolean;

  public constructor(
    public readonly guild: Guild
  ) { }

  public abstract validate(value: SettingStrategyValue): Promise<SettingStrategyValue>;

  public abstract apply(settings: Settings, value: SettingStrategyValue): Settings;

  protected isNullOrEmpty(value: SettingStrategyValue): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    if (typeof value === "string" && value.trim() === "") {
      return true;
    }

    return false;
  }

  protected sanitizeValue(value: string | number): string | number {
    if (typeof value === "string") {
      return value.trim();
    }

    return value;
  }

  protected sanitizeValues(values: (string | number)[]): (string | number)[] {
    return values.map((value) => this.sanitizeValue(value));
  }

  protected isString(value: SettingStrategyValue): value is string {
    return typeof value === "string";
  }

  protected isNumeric(value: SettingStrategyValue): value is string | number {
    if (typeof value === "string") {
      const parsed = Number(value);
      return !isNaN(parsed) && isFinite(parsed);
    }

    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  protected isStringArray(value: SettingStrategyValue): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
  }

  protected isNumberArray(value: SettingStrategyValue): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === "number");
  }
}