import type { Image } from '@/domain/value-objects/attachment'

export interface DiscordLogDtoInput {
  guildId: string;
  channelId: string;
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  color?: string;
  attachments?: Image[]
}

export class DiscordLogDto {
  private constructor(
    public readonly guildId: string,
    public readonly channelId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly fields?: { name: string; value: string; inline?: boolean }[],
    public readonly color?: string,
    public readonly attachments?: Image[]
  ) { }

  public static create(data: DiscordLogDtoInput): DiscordLogDto {
    return new DiscordLogDto(
      data.guildId,
      data.channelId,
      data.title,
      data.description,
      data.fields,
      data.color,
      data.attachments
    )
  }
}
