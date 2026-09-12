import type { DiscordLogDto } from '@/application/dtos'

export interface DiscordLogInterface {
  sendLog(dto: DiscordLogDto): Promise<void>;
}
