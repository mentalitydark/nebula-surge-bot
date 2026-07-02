import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { GuildSettings, GuildSettingsKeys, Settings } from "#entities";
import { NotFoundError } from "#errors";

type SetGuildSettingsProps = { [key in GuildSettingsKeys]?: string | null };

export class SetGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(guildId: string, props: SetGuildSettingsProps): Promise<GuildSettings> {
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

  private async insertGuildSettings(guildId: string, props: SetGuildSettingsProps): Promise<GuildSettings> {
    const guildSettings = this.repository.create({ guild: guildId, settings: Settings.fromJSON(props) })

    const insertedGuildSettings = await this.repository.insert(guildSettings)

    return insertedGuildSettings
  }

  private async updateGuildSettings(guildSettings: GuildSettings, props: SetGuildSettingsProps): Promise<GuildSettings> {
    guildSettings.settings ??= new Settings()

    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && Settings.isValidKey(key)) {
        guildSettings.settings.set(key, value)
      }
    }

    return this.repository.update(guildSettings)
  }

}