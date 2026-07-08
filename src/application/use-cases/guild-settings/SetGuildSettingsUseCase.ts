import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { GuildSettingsKeys, GuildSettingsModel, Settings } from "#entities";
import { NotFoundError } from "#errors";

type SetGuildSettingsProps = { [key in GuildSettingsKeys]?: string | null };

export class SetGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface,
    private readonly cache: CacheProviderInterface<GuildSettingsModel>
  ) { }

  /** @throws {Error} */
  public async execute(guildId: string, props: SetGuildSettingsProps): Promise<GuildSettingsModel> {
    try {
      const guildSettings = await this.repository.findByGuild(guildId)

      return this.updateGuildSettings(guildSettings, props)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return this.insertGuildSettings(guildId, props)
      }

      throw error
    }
  }

  private async insertGuildSettings(guildId: string, props: SetGuildSettingsProps): Promise<GuildSettingsModel> {
    const guildSettings = this.repository.create({ guild: guildId, settings: Settings.fromJSON(props) })

    const insertedGuildSettings = await this.repository.insert(guildSettings)

    this.cache.set(guildId, insertedGuildSettings)

    return insertedGuildSettings
  }

  private async updateGuildSettings(guildSettings: GuildSettingsModel, props: SetGuildSettingsProps): Promise<GuildSettingsModel> {
    guildSettings.settings ??= new Settings()

    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && Settings.isValidKey(key)) {
        guildSettings.settings.set(key, value)
      }
    }

    const updatedGuildSettings = await this.repository.update(guildSettings)

    this.cache.set(guildSettings.guild, updatedGuildSettings)

    return updatedGuildSettings
  }

}