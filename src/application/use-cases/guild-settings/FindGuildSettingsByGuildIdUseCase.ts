import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js"
import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js"
import { GuildSettingsModel } from "#entities"

export class FindGuildSettingsByGuildIdUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface,
    private readonly cache: CacheProviderInterface<GuildSettingsModel>
  ) { }

  /** @throws {Error} */
  public async execute(guildId: GuildSettingsModel['guild']): Promise<GuildSettingsModel> {
    const cachedSettings = this.cache.get(guildId)

    if (cachedSettings) {
      return cachedSettings
    }

    const settings = await this.repository.findByGuild(guildId)

    this.cache.set(guildId, settings)

    return settings
  }
}