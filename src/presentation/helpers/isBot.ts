import type { GuildMember } from 'discord.js'

export function isBot(member: GuildMember): boolean {
  return member.user.bot
}
