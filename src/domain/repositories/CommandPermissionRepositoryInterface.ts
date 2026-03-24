import { CommandPermissionModel } from "#entities";
import { RepositoryInterface } from "./RepositoryInterface.js";

export type CreateCommandPermissionProps = {
  commandName: string;
  roleId: string;
  guildId: string;
}

export interface CommandPermissionRepositoryInterface extends RepositoryInterface<CommandPermissionModel, CreateCommandPermissionProps> {
  /** @throws {Error} */
  findByCommand(commandName: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByRoleId(roleId: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByGuildId(guildId: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  conflitingPermission(commandName: string, roleId: string, guildId: string, id?: number): Promise<void>
}
