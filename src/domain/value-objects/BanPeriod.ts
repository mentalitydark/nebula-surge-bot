import { InvalidArgumentException } from '@/domain/errors'

export class BanPeriod {
  public static readonly NONE = new BanPeriod(0, 'Nenhuma')
  public static readonly MINUTES = new BanPeriod(3600, '1 Hora')
  public static readonly HOURS = new BanPeriod(86400, '24 Horas')
  public static readonly DAYS = new BanPeriod(604800, '7 Dias')

  public constructor(
    public readonly value: number,
    public readonly label: string
  ) { }

  public static fromSeconds(seconds: number): BanPeriod {
    const period = [BanPeriod.NONE, BanPeriod.MINUTES, BanPeriod.HOURS, BanPeriod.DAYS].find(p => p.value === seconds)

    if (!period) {
      throw new InvalidArgumentException(`Período de exclusão inválido: ${seconds} segundos`)
    }

    return period
  }
}
