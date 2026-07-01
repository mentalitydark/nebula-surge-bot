import { CreateGuildSettingsProps, GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js"
import { GuildSettings } from "#entities"

export class CreateGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(props: CreateGuildSettingsProps): Promise<GuildSettings> {
    const model = this.repository.create(props)

    const settings = await this.repository.insert(model)

    return settings
  }
}