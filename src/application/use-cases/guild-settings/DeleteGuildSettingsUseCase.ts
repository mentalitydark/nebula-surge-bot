import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { GuildSettings } from "#entities";

export class DeleteGuildSettingsUseCase {
  public constructor(
    private readonly repository: GuildSettingsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(id: GuildSettings['id']): Promise<void> {
    await this.repository.delete(id)
  }
}