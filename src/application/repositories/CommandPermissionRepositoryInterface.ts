import { CommandPermissionModel } from "#entities";
import { RepositoryInterface, SearchInput, SearchOutput } from "./RepositoryInterface.js";

export type CreateCommandPermissionProps = {
  command: string;
  role: string;
  guild: string;
}

export type SearchCommandPermissionInput = SearchInput<CommandPermissionModel> & {
  guild: string;
}

export interface CommandPermissionRepositoryInterface extends RepositoryInterface<CommandPermissionModel, CreateCommandPermissionProps> {
  search(props: SearchCommandPermissionInput): Promise<SearchOutput<CommandPermissionModel>>

  /** @throws {Error} */
  findByCommand(command: string, guild: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByRole(role: string, guild: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  findByGuild(guild: string): Promise<CommandPermissionModel[]>

  /** @throws {Error} */
  conflictingPermission(command: string, role: string, guild: string, id?: number): Promise<void>
}
