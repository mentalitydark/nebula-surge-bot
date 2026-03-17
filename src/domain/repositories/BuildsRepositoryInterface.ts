import { BuildsModel } from "#entities";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateBuildProps = {
  equipament: string,
  content: string,
}

export interface BuildsRepositoryInterface extends RepositoryInterface<BuildsModel, CreateBuildProps> {
  /** @throws {Error} */
  findByEquipament(equipament: string): Promise<BuildsModel>

  /** @throws {Error} */
  conflitingEquipament(equipament: string, id?: number): Promise<void>

  /** @throws {Error} */
  deleteByEquipament(equipament: string): Promise<void>
}