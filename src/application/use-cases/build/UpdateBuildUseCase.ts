import { BuildsRepositoryInterface, CreateBuildProps } from "#application/repositories/BuildsRepositoryInterface.js"
import { BuildModel } from "#entities"

export class UpdateBuildUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) { }

  /** @throws {Error} */
  public async execute(id: BuildModel['id'], props: CreateBuildProps): Promise<BuildModel> {
    const model = this.repository.create(props)

    await this.repository.conflictingEquipment(model.equipment, id)

    const build = await this.repository.update({ ...model, id })

    return build
  }

}