import type { BanAuditLogDto } from '@/application/dtos'

export interface BanAuditLogInterface {
  log(dto: BanAuditLogDto): Promise<void>
}
