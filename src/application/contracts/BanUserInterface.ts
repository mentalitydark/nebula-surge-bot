import type { BanUserDto, TargetMemberInfoDto } from '@/application/dtos'

export interface BanUserInterface {
  getMemberInfo(guildId: string, memberId: string): Promise<TargetMemberInfoDto | null>;
  ban(data: BanUserDto): Promise<void>;
}
