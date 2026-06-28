import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class DeleteCommandPermissionUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  /** @throws {Error} */
  public async execute(id: CommandPermissionModel['id']): Promise<void> {
    await this.repository.delete(id)
  }

}