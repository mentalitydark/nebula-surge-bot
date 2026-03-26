import { CommandPermissionModel } from "#entities";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateCommandPermissionProps = {
  command: string;
  role: string;
  guild: string;
}

export interface CommandPermissionRepositoryInterface extends RepositoryInterface<CommandPermissionModel, CreateCommandPermissionProps> {
  /** @throws {Error} */
  findByCommand(command: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByRoleId(role: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByGuildId(guild: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  conflitingPermission(command: string, role: string, guild: string, id?: number): Promise<void>
}
