import { BuildModel } from "#entities";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateBuildProps = {
  equipament: string,
  content: string,
}

export interface BuildsRepositoryInterface extends RepositoryInterface<BuildModel, CreateBuildProps> {
  /** @throws {Error} */
  findByEquipament(equipament: string): Promise<BuildModel>

  /** @throws {Error} */
  conflitingEquipament(equipament: string, id?: number): Promise<void>

  /** @throws {Error} */
  deleteByEquipament(equipament: string): Promise<void>
}