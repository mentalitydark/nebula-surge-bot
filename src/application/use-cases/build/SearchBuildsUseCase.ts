import { BuildsRepositoryInterface, SearchInput, SearchOutput } from "#application/repositories/index.js"
import { BuildModel } from "#entities"

export class SearchBuildsUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) {}

  public async execute(searchProps: SearchInput<BuildModel> = {}): Promise<SearchOutput<BuildModel>> {
    const response = await this.repository.search(searchProps)

    return response
  }

}