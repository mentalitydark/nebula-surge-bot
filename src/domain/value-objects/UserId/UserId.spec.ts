import { describe, expect, it } from "vitest";
import { UserId } from "./UserId";

describe('UserId', () => {

  it('Deve criar um UserId corretamente', () => {
    expect(new UserId('123')).toBeInstanceOf(UserId)
    expect(new UserId('<@123456789>')).toBeInstanceOf(UserId)
  })

  it('Deve lançar um erro para um UserId inválido', () => {
    expect(() => new UserId('')).toThrow()
    expect(() => new UserId('fg')).toThrow()
    expect(() => new UserId(null as any)).toThrow()
    expect(() => new UserId(undefined as any)).toThrow()
    expect(() => new UserId(' ')).toThrow()
    expect(() => new UserId('<#1234>')).toThrow()
    expect(() => new UserId('<#123f>')).toThrow()
  })

})