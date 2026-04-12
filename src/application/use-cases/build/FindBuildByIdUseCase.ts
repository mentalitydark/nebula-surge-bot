import { BuildsRepositoryInterface } from "#application/repositories/BuildsRepositoryInterface.js"
import { BuildModel } from "#entities"

export class FindBuildByIdUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) {}

  /** @throws {Error} */
  public async execute(id: BuildModel['id']): Promise<BuildModel> {
    const build = await this.repository.findById(id)

    return build
  }

}