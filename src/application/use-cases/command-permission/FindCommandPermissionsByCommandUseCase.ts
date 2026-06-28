import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class FindCommandPermissionsByCommandUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  public async execute(command: string, guild: string): Promise<CommandPermissionModel[]> {
    const permissions = await this.repository.findByCommand(command, guild);

    return permissions;
  }
}
