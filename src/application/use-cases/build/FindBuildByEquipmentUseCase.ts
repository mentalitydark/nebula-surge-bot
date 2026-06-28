import { BuildsRepositoryInterface } from "#application/repositories/BuildsRepositoryInterface.js"
import { BuildModel } from "#entities"

export class FindBuildByEquipmentUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(equipment: BuildModel['equipment']): Promise<BuildModel> {
    const build = await this.repository.findByEquipment(equipment)

    return build
  }

}