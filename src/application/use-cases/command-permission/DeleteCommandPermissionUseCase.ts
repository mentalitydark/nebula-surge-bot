import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class DeleteCommandPermissionUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
    private readonly cache: CacheProviderInterface<CommandPermissionModel>,
    private readonly cacheArray: CacheProviderInterface<CommandPermissionModel[]>,
  ) { }

  /** @throws {Error} */
  public async execute(id: CommandPermissionModel['id']): Promise<void> {
    await this.repository.delete(id)

    this.cache.delete(id)

    this.cacheArray.clear()
  }

}