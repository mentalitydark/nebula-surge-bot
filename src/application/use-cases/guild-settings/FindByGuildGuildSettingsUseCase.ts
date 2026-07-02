import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js"
import { GuildSettings } from "#entities"

export class FindByGuildGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(guildId: GuildSettings['guild']): Promise<GuildSettings> {
    const settings = await this.repository.findByGuild(guildId)

    return settings
  }
}