import type { HexColor, Image } from '@/domain/value-objects'

export interface SendEmbedMessageDto {
  readonly guildId: string
  readonly channelId: string
  readonly roleNotificationIds: readonly string[]
  readonly embedColor: HexColor
  readonly description: string
  readonly attachment?: Image
}

export interface SendEmbedMessageInterface {
  send(data: SendEmbedMessageDto): Promise<void>
}
