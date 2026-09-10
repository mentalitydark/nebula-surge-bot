export interface SendEmbedMessageDTO {
  guildId: string
  channelId: string
  roleNotificationIds: string[]
  embedColor: string
  description: string
  attachmentUrl?: string
}

export interface SendEmbedMessageInterface {
  send(data: SendEmbedMessageDTO): Promise<void>
}
