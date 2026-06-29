import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class FindCommandPermissionByIdUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  public async execute(id: CommandPermissionModel['id']): Promise<CommandPermissionModel> {
    const permission = await this.repository.findById(id);

    return permission;
  }

}