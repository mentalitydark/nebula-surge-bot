import { Guild, GuildMember } from "discord.js";

export class RemoveUserMessagesUseCase {

  public constructor(
    private readonly guild: Guild
  ) { }

  public async execute(userTarget: GuildMember): Promise<number> {
    const channels = await this.guild.channels.fetch();

    const channelsToDeleteFrom = Array.from(channels.values()).filter(c => c && c.isTextBased() && c.permissionsFor(userTarget)?.has('SendMessages'));

    const chunkSize = 5
    const messagesToDeleteCount: Record<string, number> = {}
    for (let i = 0; i < channelsToDeleteFrom.length; i += chunkSize) {
      const chunk = channelsToDeleteFrom.slice(i, i + chunkSize)

      await Promise.allSettled(
        chunk.map(async (channel) => {
          if (!channel || !channel.isTextBased() || !channel.permissionsFor(userTarget)?.has('SendMessages')) return

          const messages = await channel.messages.fetch({ limit: 100 })
          const userMessages = messages.filter(m => m.author.id === userTarget.id)

          if (userMessages.size > 0) {
            await channel.bulkDelete(userMessages, true).catch(() => null)
            messagesToDeleteCount[channel.id] = userMessages.size
          }
        })
      ).catch(() => null)
    }

    return Object.values(messagesToDeleteCount).reduce((acc, count) => acc + count, 0)
  }

}