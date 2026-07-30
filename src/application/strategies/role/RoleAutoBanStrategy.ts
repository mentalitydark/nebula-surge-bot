import { SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { RoleSettingStrategy } from "./RoleSettingStrategy.js";

export class RoleAutoBanStrategy extends RoleSettingStrategy {
  public readonly key = GuildSettingsKeys.ROLE_AUTO_BAN;
  public readonly allowMultipleRoles = false;

  public get(settings: Settings): SettingStrategyValue {
    const value = settings.get(this.key);

    if (value === undefined || value === null) {
      return null;
    }

    if (!this.isSingleRole(value)) {
      throw new BadRequestError("O valor armazenado não é um ID de cargo válido.");
    }

    return value;
  }
}