export interface TargetMemberInfoDtoInput {
  id: string
  username: string
  isStaff: boolean
  isBot: boolean
}

export class TargetMemberInfoDto {

  private constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly isStaff: boolean,
    public readonly isBot: boolean,
  ) { }

  public static create(input: TargetMemberInfoDtoInput): TargetMemberInfoDto {
    const { id, username, isStaff, isBot } = input
    return new TargetMemberInfoDto(id, username, isStaff, isBot)
  }
}