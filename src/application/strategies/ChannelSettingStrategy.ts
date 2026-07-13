import { SettingStrategy } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { Guild } from "discord.js";

export abstract class ChannelSettingStrategy implements SettingStrategy {
  abstract readonly key: GuildSettingsKeys;
  abstract readonly allowMultipleChannels: boolean;

  public constructor(
    public readonly guild: Guild
  ) { }

  public async validate(value: string | string[] | null): Promise<string | string[] | null> {
    if (this.isNullOrEmpty(value)) {
      return null;
    }

    if (this.allowMultipleChannels) {
      if (!this.isMultipleChannels(value)) {
        value = [value as string];
      }

      if (!this.isValidChannelIdArray(value)) {
        throw new BadRequestError('Um ou mais IDs de canal fornecidos são inválidos.');
      }

      for (const channelId of value) {
        const exists = await this.existsChannelInGuild(channelId);
        if (!exists) {
          throw new BadRequestError(`O canal com ID ${channelId} não existe no servidor ou não é um canal de texto.`);
        }
      }

      return value.map((channelId) => this.sanitizeChannelId(channelId));
    }

    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    }

    if (!this.isSingleChannel(value)) {
      throw new BadRequestError("Esperado um único ID de canal.");
    }

    if (!this.isValidChannelId(value)) {
      throw new BadRequestError("O ID do canal é inválido.");
    }

    const exists = await this.existsChannelInGuild(value);
    if (!exists) {
      throw new BadRequestError(`O canal com ID ${value} não existe no servidor ou não é um canal de texto.`);
    }

    return this.sanitizeChannelId(value);
  }

  public apply(settings: Settings, value: string | string[] | null): Settings {
    if (this.isNullOrEmpty(value)) {
      settings.delete(this.key);

      return settings;
    }

    if (this.allowMultipleChannels) {
      if (!this.isMultipleChannels(value)) {
        value = [value as string];
      }

      settings.set(this.key, value);

      return settings;
    }

    if (this.isSingleChannel(value)) {
      settings.set(this.key, value);

      return settings;
    }

    return settings;
  }

  protected sanitizeChannelId(channelId: string): string {
    return channelId.replace(/[<#>]/g, '');
  }

  protected isNullOrEmpty(value: string | string[] | null): boolean {
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

  protected isSingleChannel(value: string | string[] | null): value is string {
    return typeof value === "string";
  }

  protected isMultipleChannels(value: string | string[] | null): value is string[] {
    return Array.isArray(value);
  }

  protected isValidChannelId(channelId: string): boolean {
    const channelRegex = /^<#\d{17,19}>$/;
    return channelRegex.test(channelId);
  }

  protected isValidChannelIdArray(channelIds: string[]): boolean {
    return channelIds.every(channelId => this.isValidChannelId(channelId));
  }

  protected async existsChannelInGuild(channelId: string): Promise<boolean> {
    try {
      const channel = await this.guild.channels.fetch(this.sanitizeChannelId(channelId));

      return !!channel && channel.isTextBased();
    } catch {
      return false;
    }
  }
}