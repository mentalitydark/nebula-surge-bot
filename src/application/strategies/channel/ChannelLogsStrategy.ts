import { GuildSettingsKeys } from "#entities";
import { ChannelSettingStrategy } from "./ChannelSettingStrategy.js";

export class ChannelLogsStrategy extends ChannelSettingStrategy {
  public readonly key = GuildSettingsKeys.CHANNEL_LOGS;
  public readonly allowMultipleChannels = false;
}