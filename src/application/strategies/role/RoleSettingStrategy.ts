import type { GuildSettingsKeys, Settings } from "#domain/entities/Settings.js";
import { SettingStrategy, SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { BadRequestError } from "#errors";
import { Guild } from "discord.js";

export abstract class RoleSettingStrategy implements SettingStrategy {
  abstract readonly key: GuildSettingsKeys;
  abstract readonly allowMultipleRoles: boolean;
  abstract get(settings: Settings): SettingStrategyValue;

  public constructor(
    public readonly guild: Guild
  ) { }

  public async validate(value: SettingStrategyValue): Promise<string | string[] | null> {
    if (this.isNullOrEmpty(value)) {
      return null;
    }

    if (this.allowMultipleRoles) {
      if (!this.isMultipleRoles(value)) {
        value = [value as string];
      }

      if (!this.isValidRoleIdArray(value)) {
        throw new BadRequestError('Um ou mais IDs de cargo fornecidos são inválidos.');
      }

      for (const roleId of value) {
        const exists = await this.existsRoleInGuild(roleId);
        if (!exists) {
          throw new BadRequestError(`O cargo com ID ${roleId} não existe no servidor.`);
        }
      }

      return value.map((roleId) => this.sanitizeRoleId(roleId));
    }

    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    }

    if (!this.isSingleRole(value)) {
      throw new BadRequestError("Esperado um único ID de cargo.");
    }

    if (!this.isValidRoleId(value)) {
      throw new BadRequestError("O ID do cargo é inválido.");
    }

    const exists = await this.existsRoleInGuild(value);
    if (!exists) {
      throw new BadRequestError(`O cargo com ID ${value} não existe no servidor.`);
    }

    return this.sanitizeRoleId(value);
  }

  public apply(settings: Settings, value: SettingStrategyValue): Settings {
    if (this.isNullOrEmpty(value)) {
      settings.delete(this.key);
    }

    if (this.allowMultipleRoles) {
      if (!this.isMultipleRoles(value)) {
        value = [value as string];
      }

      settings.set(this.key, value);

      return settings;
    }

    if (this.isSingleRole(value)) {
      settings.set(this.key, value);

      return settings;
    }

    return settings;
  }

  protected isNullOrEmpty(value: SettingStrategyValue): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === "string" && value.trim() === "") {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    return false;
  }

  protected sanitizeRoleId(roleId: string): string {
    return roleId.replace(/[<@&>]/g, '');
  }

  protected isSingleRole(value: SettingStrategyValue): value is string {
    return typeof value === "string";
  }

  protected isMultipleRoles(value: SettingStrategyValue): value is string[] {
    return Array.isArray(value);
  }

  protected isValidRoleId(roleId: string): boolean {
    const roleRegex = /^<@&\d{17,19}>$/;
    return roleRegex.test(roleId);
  }

  protected isValidRoleIdArray(roleIds: string[]): boolean {
    return roleIds.every(roleId => this.isValidRoleId(roleId));
  }

  protected async existsRoleInGuild(roleId: string): Promise<boolean> {
    try {
      const role = await this.guild.roles.fetch(this.sanitizeRoleId(roleId));

      return !!role;
    } catch {
      return false;
    }
  }
}