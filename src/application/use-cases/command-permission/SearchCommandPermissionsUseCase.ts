import { CommandPermissionRepositoryInterface } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { SearchInput, SearchOutput } from "#application/repositories/RepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class SearchCommandPermissionsUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  public async execute(searchProps: SearchInput<CommandPermissionModel> = {}): Promise<SearchOutput<CommandPermissionModel>> {
    const response = await this.repository.search(searchProps);

    return response;
  }

}