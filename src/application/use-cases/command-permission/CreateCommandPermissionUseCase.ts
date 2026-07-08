import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionRepositoryInterface, CreateCommandPermissionProps } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class CreateCommandPermissionUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
    private readonly cache: CacheProviderInterface<CommandPermissionModel>
  ) { }

  public async execute(data: CreateCommandPermissionProps) {
    const model = this.repository.create(data)

    await this.repository.conflictingPermission(model.command, model.role, model.guild)

    const permission = await this.repository.insert(model)

    this.cache.set(permission.id, permission, 10 * 60)

    return permission
  }
}