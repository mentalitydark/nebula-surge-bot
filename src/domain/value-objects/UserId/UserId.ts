import { InvalidArgumentException } from '@/domain/errors'

export class UserId {
  private readonly value: string

  public constructor(value: string) {
    if (!this.validate(value)) {
      throw new InvalidArgumentException(`Invalid user ID: ${value}`)
    }

    this.value = value.replace(/[^0-9]/g, '')
  }

  public static create(value: string): UserId {
    return new UserId(value)
  }

  public getValue(): string {
    return this.value
  }

  private validate(value: string): boolean {
    return /^\<\@\d+\>$/.test(value) || /^\d+$/.test(value)
  }

}
