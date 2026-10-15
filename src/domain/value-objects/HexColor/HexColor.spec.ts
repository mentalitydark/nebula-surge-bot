import { describe, expect, it } from "vitest";
import { HexColor } from "./HexColor";

describe('HexColor', () => {

  it('Deve validar corretamente uma cor hexadecimal', () => {
    expect(new HexColor('#FFFFFF')).toBeInstanceOf(HexColor)
    expect(new HexColor('#000000')).toBeInstanceOf(HexColor)
    expect(new HexColor('#ffFFff')).toBeInstanceOf(HexColor)
    expect(new HexColor('#fff')).toBeInstanceOf(HexColor)
    expect(new HexColor('#ffffff')).toBeInstanceOf(HexColor)
  })

  it('Deve lançar um erro para uma cor hexadecimal inválida', () => {
    expect(() => new HexColor('invalid')).toThrow()
    expect(() => new HexColor('#1234')).toThrow()
    expect(() => new HexColor('#GGGGGG')).toThrow()
    expect(() => new HexColor('#FFFFF')).toThrow()
  })

})