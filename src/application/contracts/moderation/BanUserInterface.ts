export interface BanUserDto {
  readonly guildId: string
  readonly userId: string
  readonly reason: string
  readonly deleteMessageSeconds: number
}

export interface TargetMemberInfoDto {
  readonly id: string
  readonly username: string
  readonly isStaff: boolean
  readonly isBot: boolean
}

export interface BanUserInterface {
  getMemberInfo(guildId: string, memberId: string): Promise<TargetMemberInfoDto | null>
  ban(data: BanUserDto): Promise<void>
}
