import { BuildsModel } from "#entities";
import { ConflictError, NotFoundError } from "#errors";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateBuildProps = {
  equipament: string,
  content: string,
}

export interface BuildsRepositoryInterface extends RepositoryInterface<BuildsModel, CreateBuildProps> {
  /** @throws {NotFoundError} */
  findByEquipament(equipament: string): Promise<BuildsModel>

  /** @throws {ConflictError} */
  conflitingEquipament(equipament: string): Promise<void>

  /** @throws {NotFoundError} */
  deleteByEquipament(equipament: string): Promise<void>
}