import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class FindCommandPermissionsByCommandUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
    private readonly cache: CacheProviderInterface<CommandPermissionModel[]>
  ) { }

  public async execute(command: string, guild: string): Promise<CommandPermissionModel[]> {
    const cachedPermission = this.cache.get(`${guild}:${command}`);

    if (cachedPermission) {
      return cachedPermission;
    }

    const permissions = await this.repository.findByCommand(command, guild);

    this.cache.set(`${guild}:${command}`, permissions, 3600);

    return permissions;
  }
}
