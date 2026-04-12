import { BuildsRepositoryInterface, CreateBuildProps } from "#application/repositories/BuildsRepositoryInterface.js";
import { BuildModel } from "#entities";

export class CreateBuildUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) {}

  /** @throws {Error} */
  public async execute(props: CreateBuildProps): Promise<BuildModel> {
    const model = this.repository.create(props)

    await this.repository.conflitingEquipament(model.equipament)

    const build = await this.repository.insert(model)

    return build
  }
}