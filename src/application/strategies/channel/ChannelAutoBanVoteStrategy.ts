import { GuildSettingsKeys } from "#entities";
import { ChannelSettingStrategy } from "./ChannelSettingStrategy.js";

export class ChannelAutoBanVoteStrategy extends ChannelSettingStrategy {
  public readonly key = GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE;
  public readonly allowMultipleChannels = false;
}