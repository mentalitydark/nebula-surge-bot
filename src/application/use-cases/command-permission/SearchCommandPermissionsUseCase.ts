import { SearchCommandPermissionInput } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { SearchOutput } from "#application/repositories/RepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class SearchCommandPermissionsUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  public async execute(searchProps: SearchCommandPermissionInput): Promise<SearchOutput<CommandPermissionModel>> {
    const response = await this.repository.search(searchProps);

    return response;
  }

}