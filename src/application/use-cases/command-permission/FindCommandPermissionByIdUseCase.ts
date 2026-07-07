import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class FindCommandPermissionByIdUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
    private readonly cache: CacheProviderInterface<CommandPermissionModel>
  ) { }

  public async execute(id: CommandPermissionModel['id']): Promise<CommandPermissionModel> {
    const cachedPermission = this.cache.get(id);

    if (cachedPermission) {
      return cachedPermission;
    }

    const permission = await this.repository.findById(id);

    if (permission) {
      this.cache.set(id, permission, 3600);
    }

    return permission;
  }

}