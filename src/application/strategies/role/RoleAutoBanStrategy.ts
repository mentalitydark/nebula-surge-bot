import { GuildSettingsKeys } from "#entities";
import { RoleSettingStrategy } from "./RoleSettingStrategy.js";

export class RoleAutoBanStrategy extends RoleSettingStrategy {
  public readonly key = GuildSettingsKeys.ROLE_AUTO_BAN;
  public readonly allowMultipleRoles = false;
}