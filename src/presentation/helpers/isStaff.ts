import type { GuildMember } from 'discord.js'

import { rolesId } from '@/infrastructure/config'

export function isStaff(member: GuildMember): boolean {
  if (!member) return false

  if (member.roles.cache.some(role => role.id === rolesId.executor)) return true

  if (member.permissions.has('Administrator')) return true

  return false
}
