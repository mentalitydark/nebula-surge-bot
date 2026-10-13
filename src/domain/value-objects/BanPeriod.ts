import { InvalidArgumentException } from '@/domain/errors'

export class BanPeriod {
  public static readonly NONE = new BanPeriod(0, 'Nenhuma')
  public static readonly ONE_HOUR = new BanPeriod(3600, '1 Hora')
  public static readonly ONE_DAY = new BanPeriod(86400, '24 Horas')
  public static readonly ONE_WEEK = new BanPeriod(604800, '7 Dias')

  public constructor(
    public readonly value: number,
    public readonly label: string
  ) { }

  public static fromSeconds(seconds: number): BanPeriod {
    const period = [BanPeriod.NONE, BanPeriod.ONE_HOUR, BanPeriod.ONE_DAY, BanPeriod.ONE_WEEK].find(p => p.value === seconds)

    if (!period) {
      throw new InvalidArgumentException(`Período de exclusão inválido: ${seconds} segundos`)
    }

    return period
  }
}
