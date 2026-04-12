import { BuildsRepositoryInterface } from "#application/repositories/BuildsRepositoryInterface.js"
import { BuildModel } from "#entities"

export class FindBuildByEquipamentUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) {}

  /** @throws {Error} */
  public async execute(equipament: BuildModel['equipament']): Promise<BuildModel> {
    const build = await this.repository.findByEquipament(equipament)

    return build
  }

}