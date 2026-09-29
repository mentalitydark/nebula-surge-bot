import { InvalidArgumentException, InvalidUrlException, RangeException } from '@/domain/errors'

export class Image {

  public constructor(
    public readonly url: string,
    public readonly contentType: string,
    public readonly size: number,
    public readonly name?: string,
  ) {
    this.validate()

    this.name = this.generateName()
  }

  private generateName(): string {
    if (this.name) {
      return this.name
    }

    const url = new URL(this.url)

    const lastSegment = url.pathname.split('/').filter(Boolean).pop() ?? ''

    const extension = lastSegment.split('.').pop() ?? 'png'

    return `${crypto.randomUUID()}.${extension}`
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
