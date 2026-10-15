import { describe, expect, it } from "vitest";
import { Image } from "./Image";

describe('Image', () => {

  it('Deve criar uma instância de Image corretamente', () => {
    expect(new Image('https://example.com/image.jpg', 'image/jpeg', 1024)).toBeInstanceOf(Image)
  })

  it('Deve criar uma instância de Image com um nome válido e UUID', () => {
    const image = new Image('https://example.com/image.jpg', 'image/jpeg', 1024)
    expect(image).toBeInstanceOf(Image)
    expect(image.name).toMatch(/[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}\.[\w]+$/)
  })

  it('Deve lançar um erro ao utilizar um mimetype inválido', () => {
    expect(() => new Image('https://example.com/image.jpg', 'invalid/mimetype', 1024)).toThrow()
  })

  it('Deve lançar um erro ao utilizar um tamanho de arquivo inválido', () => {
    expect(() => new Image('https://example.com/image.jpg', 'image/jpeg', -1)).toThrow()
  })

  it('Deve lançar um erro ao utilizar uma URL de arquivo inválido', () => {
    expect(() => new Image('invalid-url', 'image/jpeg', 1024)).toThrow()
  })

})