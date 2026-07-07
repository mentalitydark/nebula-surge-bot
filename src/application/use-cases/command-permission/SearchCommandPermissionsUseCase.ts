import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionRepositoryInterface, SearchCommandPermissionInput } from "#application/repositories/CommandPermissionRepositoryInterface.js";
import { SearchOutput } from "#application/repositories/RepositoryInterface.js";
import { CommandPermissionModel } from "#entities";

export class SearchCommandPermissionsUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
    private readonly cache: CacheProviderInterface<CommandPermissionModel[]>
  ) { }

  public async execute(searchProps: SearchCommandPermissionInput): Promise<SearchOutput<CommandPermissionModel>> {
    const filters = {
      guild: searchProps.guild,
      page: searchProps.page ?? 1,
      per_page: searchProps.per_page ?? 10,
      filter: searchProps.filter ?? 'none'
    }

    const key = JSON.stringify(filters);

    const cached = this.cache.get(key);

    if (cached) {
      return {
        current_page: filters.page,
        per_page: filters.per_page,
        data: cached,
        total: cached.length
      };
    }

    const response = await this.repository.search(searchProps);

    this.cache.set(key, response.data, 10 * 60);

    return response;
  }

}