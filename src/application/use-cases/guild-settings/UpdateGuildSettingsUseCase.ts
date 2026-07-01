import { CreateGuildSettingsProps, GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js"
import { GuildSettings } from "#entities"

export class UpdateGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(id: GuildSettings['id'], props: CreateGuildSettingsProps): Promise<GuildSettings> {
    const model = this.repository.create(props)

    const updatedSettings = await this.repository.update({ ...model, id })

    return updatedSettings
  }
}