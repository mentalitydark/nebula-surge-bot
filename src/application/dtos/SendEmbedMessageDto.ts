import type { HexColor } from '@/domain/value-objects'
import type { Image } from '@/domain/value-objects/attachment'

export interface SendEmbedMessageDtoInput {
  guildId: string
  channelId: string
  roleNotificationIds: string[]
  embedColor: HexColor
  description: string
  attachment?: Image
}

export class SendEmbedMessageDto {
  private constructor(
    public readonly guildId: string,
    public readonly channelId: string,
    public readonly roleNotificationIds: string[],
    public readonly embedColor: HexColor,
    public readonly description: string,
    public readonly attachment?: Image,
  ) { }

  public static create(data: SendEmbedMessageDtoInput): SendEmbedMessageDto {
    return new SendEmbedMessageDto(
      data.guildId,
      data.channelId,
      data.roleNotificationIds,
      data.embedColor,
      data.description,
      data.attachment
    )
  }
}
