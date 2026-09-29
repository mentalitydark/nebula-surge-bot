import type { Time } from '@/domain/enums'

export interface BanUserDtoInput {
  guildId: string;
  userId: string;
  reason: string;
  deleteMessageSeconds: Time;
}

export class BanUserDto {
  private constructor(
    public readonly guildId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly deleteMessageSeconds: Time
  ) { }

  public static create(input: BanUserDtoInput) {
    return new BanUserDto(input.guildId, input.userId, input.reason, input.deleteMessageSeconds)
  }
}
