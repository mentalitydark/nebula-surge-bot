import { BuildModel } from "#entities";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateBuildProps = {
  equipment: string,
  content: string,
}

export interface BuildsRepositoryInterface extends RepositoryInterface<BuildModel, CreateBuildProps> {
  /** @throws {Error} */
  findByEquipment(equipment: string): Promise<BuildModel>

  /** @throws {Error} */
  conflictingEquipment(equipment: string, id?: number): Promise<void>

  /** @throws {Error} */
  deleteByEquipment(equipment: string): Promise<void>
}