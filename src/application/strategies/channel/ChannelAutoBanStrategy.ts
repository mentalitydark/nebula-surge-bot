import { SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { ChannelSettingStrategy } from "./ChannelSettingStrategy.js";

export class ChannelAutoBanStrategy extends ChannelSettingStrategy {
  public readonly key = GuildSettingsKeys.CHANNEL_AUTO_BAN;
  public readonly allowMultipleChannels = true;

  public get(settings: Settings): SettingStrategyValue {
    const value = settings.get(this.key);

    if (this.isNullOrEmpty(value)) {
      return null;
    }

    if (this.isSingleChannel(value)) {
      throw new BadRequestError("O valor armazenado não é um ID de canal válido.");
    }

    return value;
  }
}