import { SettingStrategy } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys } from "#entities";
import { BadRequestError } from "#errors";
import { Guild } from "discord.js";
import { ChannelAutoBanStrategy, ChannelAutoBanVoteStrategy, ChannelLogsStrategy, ChannelMessagesRemovedStrategy } from "./channel/index.js";
import { AutoBanVoteThresholdSettingStrategy } from "./mixed/index.js";
import { RoleAutoBanStrategy } from "./role/index.js";

type SettingStrategyFactory = (guild: Guild) => SettingStrategy;

export class SettingStrategyRegistry {
  private static readonly factories: Map<GuildSettingsKeys, SettingStrategyFactory> = new Map();

  public static register(key: GuildSettingsKeys, factory: SettingStrategyFactory): void {
    if (this.factories.has(key)) {
      throw new Error(`Strategy with key "${key}" is already registered.`);
    }

    this.factories.set(key, factory);
  }

  public static get(key: GuildSettingsKeys, guild: Guild): SettingStrategy {
    const factory = this.factories.get(key);

    if (!factory) {
      throw new BadRequestError(`Nenhuma estratégia encontrada para a configuração "${key}".`);
    }

    return factory(guild);
  }

  /** @visibleForTesting */
  public static clear(): void {
    this.factories.clear();
  }
}

SettingStrategyRegistry.register(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, (guild: Guild) => new ChannelMessagesRemovedStrategy(guild));
SettingStrategyRegistry.register(GuildSettingsKeys.CHANNEL_AUTO_BAN, (guild: Guild) => new ChannelAutoBanStrategy(guild));
SettingStrategyRegistry.register(GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE, (guild: Guild) => new ChannelAutoBanVoteStrategy(guild));
SettingStrategyRegistry.register(GuildSettingsKeys.CHANNEL_LOGS, (guild: Guild) => new ChannelLogsStrategy(guild));
SettingStrategyRegistry.register(GuildSettingsKeys.ROLE_AUTO_BAN, (guild: Guild) => new RoleAutoBanStrategy(guild));
SettingStrategyRegistry.register(GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD, (guild: Guild) => new AutoBanVoteThresholdSettingStrategy(guild));