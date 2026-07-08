import { CommandPermissionModel, GuildSettingsModel } from "#entities";

export interface CacheRegistry {
  'global': any
  'command-permissions:id': CommandPermissionModel
  'command-permissions:array': CommandPermissionModel[]
  'guild-settings:id': GuildSettingsModel
}