import { Guild, GuildMember } from "discord.js";

export class BanUserUseCase {

  public async execute(userTarget: GuildMember, guild: Guild, reason: string): Promise<void> {
    await guild.members.ban(userTarget, { reason, deleteMessageSeconds: 3600 * 24 * 7 });
  }
}