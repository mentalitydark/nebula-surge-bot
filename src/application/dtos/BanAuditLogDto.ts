import type { GuildId } from '@/domain/types'
import type { UserId, BanPeriod } from '@/domain/value-objects'
import type { Image } from '@/domain/value-objects/attachment'

export interface BanAuditLogDtoProps {
  guildId: GuildId;
  executorId: UserId;
  targetUserId: UserId;
  reason: string;
  deleteMessageBanPeriodLabel: BanPeriod['label'];
  attachment?: Image;
}

export class BanAuditLogDto {
  private constructor(
    public readonly guildId: GuildId,
    public readonly executorId: UserId,
    public readonly targetUserId: UserId,
    public readonly reason: string,
    public readonly deleteMessageBanPeriodLabel: BanPeriod['label'],
    public readonly attachment?: Image
  ) { }

  public static create(props: BanAuditLogDtoProps): BanAuditLogDto {
    return new BanAuditLogDto(
      props.guildId,
      props.executorId,
      props.targetUserId,
      props.reason,
      props.deleteMessageBanPeriodLabel,
      props.attachment
    )
  }
}
