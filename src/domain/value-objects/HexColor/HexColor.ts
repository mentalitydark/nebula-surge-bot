import { InvalidArgumentException } from '@/domain/errors'

export class HexColor {
  public readonly color: string

  public constructor(hex: string) {
    if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)) {
      throw new InvalidArgumentException('Cor deve estar no formato hexadecimal válido, ex: #FFAABB ou #FAB')
    }

    this.color = hex.toUpperCase()
  }

}
