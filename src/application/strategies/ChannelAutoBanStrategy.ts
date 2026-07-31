import { GuildSettingsKeys } from "#entities";
import { ChannelSettingStrategy } from "./ChannelSettingStrategy.js";

export class ChannelAutoBanStrategy extends ChannelSettingStrategy {
  public readonly key = GuildSettingsKeys.CHANNEL_AUTO_BAN;
  public readonly allowMultipleChannels = true;
}