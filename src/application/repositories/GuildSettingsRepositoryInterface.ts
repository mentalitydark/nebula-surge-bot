import { GuildSettings, Settings } from "#entities";
import { RepositoryInterface, SearchInput } from "./RepositoryInterface.js";

export type CreateGuildSettingsProps = {
  guild: string,
  settings: Settings | null,
}

export type SearchGuildSettingsInput = SearchInput<GuildSettings> & {
  guild: string,
}

export interface GuildSettingsRepositoryInterface extends RepositoryInterface<GuildSettings, CreateGuildSettingsProps> {
  /** @throws {Error} */
  findByGuild(guild: string): Promise<GuildSettings>
}