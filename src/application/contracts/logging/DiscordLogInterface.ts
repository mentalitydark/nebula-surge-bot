import type { Image } from '@/domain/value-objects'

export interface DiscordLogField {
  readonly name: string
  readonly value: string
  readonly inline?: boolean
}

export interface DiscordLogDto {
  readonly guildId: string
  readonly channelId: string
  readonly title: string
  readonly description?: string
  readonly fields?: DiscordLogField[]
  readonly color?: string
  readonly attachments?: readonly Image[]
}

export interface DiscordLogInterface {
  sendLog(dto: DiscordLogDto): Promise<void>
}
