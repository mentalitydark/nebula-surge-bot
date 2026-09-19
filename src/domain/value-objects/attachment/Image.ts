import { InvalidArgumentException, InvalidUrlException, RangeException } from '@/domain/errors'

export class Image {

  public constructor(
    public readonly url: string,
    public readonly contentType: string,
    public readonly size: number,
  ) {
    this.validate()
  }

  private validate() {
    this.validateUrl(this.url)
    this.validateSize(this.size)
    this.validateContentType(this.contentType)
  }

  private validateUrl(url: string): void {
    if (!URL.canParse(url)) {
      throw new InvalidUrlException(url)
    }
  }

  private validateContentType(contentType: string): void {
    if (!contentType || !contentType.startsWith('image/')) {
      throw new InvalidArgumentException('Tipo de conteúdo inválido. Deve ser uma imagem.')
    }
  }

  private validateSize(size: number): void {
    const TEN_MB = 10 * 1024 * 1024

    if (size <= 0 || size > TEN_MB) {
      throw new RangeException('Tamanho do arquivo inválido. Deve estar entre 1 byte e 10 MB.')
    }
  }

}
