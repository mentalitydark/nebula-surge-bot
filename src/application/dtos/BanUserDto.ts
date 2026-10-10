export interface BanUserDtoInput {
  guildId: string;
  userId: string;
  reason: string;
  deleteMessageSeconds: number;
}

export class BanUserDto {
  private constructor(
    public readonly guildId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly deleteMessageSeconds: number
  ) { }

  public static create(input: BanUserDtoInput) {
    return new BanUserDto(input.guildId, input.userId, input.reason, input.deleteMessageSeconds)
  }
}
