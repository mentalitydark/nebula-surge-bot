import type { GuildId } from '@/domain/types'
import type { UserId, BanPeriod, Image } from '@/domain/value-objects'

export interface BanAuditLogDto {
  readonly guildId: GuildId
  readonly executorId: UserId
  readonly targetUserId: UserId
  readonly reason: string
  readonly deleteMessageBanPeriodLabel: BanPeriod['label']
  readonly attachment?: Image
}

export interface BanAuditLogInterface {
  log(dto: BanAuditLogDto): Promise<void>
}
