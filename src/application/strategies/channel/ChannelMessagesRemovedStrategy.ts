import { GuildSettingsKeys } from "#entities";
import { ChannelSettingStrategy } from "./ChannelSettingStrategy.js";

export class ChannelMessagesRemovedStrategy extends ChannelSettingStrategy {
  public readonly key = GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED;
  public readonly allowMultipleChannels = false;
}