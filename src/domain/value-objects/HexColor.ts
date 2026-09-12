import { InvalidArgumentException } from '@/domain/errors'

export class HexColor {
  public readonly color: string

  public constructor(hex: string) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      throw new InvalidArgumentException('Cor deve estar no formato hexadecimal válido, ex: #FFAABB')
    }

    this.color = hex.toUpperCase()
  }

}
