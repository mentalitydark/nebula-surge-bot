import { BuildsRepositoryInterface, CreateBuildProps } from "#application/repositories/BuildsRepositoryInterface.js";
import { BuildModel } from "#entities";

export class CreateBuildUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(props: CreateBuildProps): Promise<BuildModel> {
    const model = this.repository.create(props)

    await this.repository.conflictingEquipment(model.equipment)

    const build = await this.repository.insert(model)

    return build
  }
}