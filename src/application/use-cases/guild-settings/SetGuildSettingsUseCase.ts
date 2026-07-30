import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { SettingStrategyRegistry } from "#application/strategies/SettingStrategyRegistry.js";
import { SettingStrategy, SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, GuildSettingsModel, Settings } from "#entities";
import { NotFoundError } from "#errors";
import { Guild } from "discord.js";

export class SetGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface,
    private readonly cache: CacheProviderInterface<GuildSettingsModel>
  ) { }

  /** @throws {Error} */
  public async execute(key: GuildSettingsKeys, value: SettingStrategyValue, guild: Guild): Promise<GuildSettingsModel> {
    const strategy = SettingStrategyRegistry.get(key, guild)

    const validatedValue = await strategy.validate(value)

    const guildSettings = await this.repository.findByGuild(guild.id).catch((error) => {
      if (error instanceof NotFoundError) {
        return null
      }

      throw error
    })

    let guildSettingsModel: GuildSettingsModel

    if (guildSettings) {
      guildSettingsModel = await this.updateGuildSettings(guildSettings, validatedValue, strategy)
    } else {
      guildSettingsModel = await this.insertGuildSettings(validatedValue, strategy, guild)
    }

    this.cache.set(guild.id, guildSettingsModel)

    return guildSettingsModel
  }

  private async insertGuildSettings(value: SettingStrategyValue, strategy: SettingStrategy, guild: Guild): Promise<GuildSettingsModel> {
    const model = this.repository.create({ guild: guild.id, settings: null })

    const settings = new Settings()

    strategy.apply(settings, value)

    model.settings = settings

    return await this.repository.insert(model)
  }

  private async updateGuildSettings(guildSettings: GuildSettingsModel, value: SettingStrategyValue, strategy: SettingStrategy): Promise<GuildSettingsModel> {
    guildSettings.settings ??= new Settings()

    strategy.apply(guildSettings.settings, value)

    return await this.repository.update(guildSettings)
  }

}