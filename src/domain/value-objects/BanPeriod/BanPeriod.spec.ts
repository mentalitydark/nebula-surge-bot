import { describe, it, expect } from 'vitest'

import { InvalidArgumentException } from '@/domain/errors'
import { BanPeriod } from '@/domain/value-objects'

describe('BanPeriod', () => {
  it('Deve retornar uma instância de BanPeriod válida', () => {
    expect(BanPeriod.fromSeconds(0)).toBe(BanPeriod.NONE)
    expect(BanPeriod.fromSeconds(3600)).toBe(BanPeriod.ONE_HOUR)
    expect(BanPeriod.fromSeconds(86400)).toBe(BanPeriod.ONE_DAY)
    expect(BanPeriod.fromSeconds(604800)).toBe(BanPeriod.ONE_WEEK)
  })

  it('Deve lançar uma exceção para um período de exclusão inválido', () => {
    expect(() => BanPeriod.fromSeconds(123)).toThrow(InvalidArgumentException)
    expect(() => BanPeriod.fromSeconds(-1)).toThrow(InvalidArgumentException)
  })

  it('Deve retornar o rótulo correto para cada período de exclusão', () => {
    expect(BanPeriod.NONE.label).toBe('Nenhuma')
    expect(BanPeriod.ONE_HOUR.label).toBe('1 Hora')
    expect(BanPeriod.ONE_DAY.label).toBe('24 Horas')
    expect(BanPeriod.ONE_WEEK.label).toBe('7 Dias')
  })
})
