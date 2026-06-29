import { BuildsRepositoryInterface } from "#application/repositories/BuildsRepositoryInterface.js";
import { BuildModel } from "#entities";

export class DeleteBuildUseCase {
  public constructor(
    private readonly repository: BuildsRepositoryInterface
  ) {}

  /** @throws {Error} */
  public async execute(id: BuildModel['id']): Promise<void> {
    await this.repository.delete(id)
  }
}