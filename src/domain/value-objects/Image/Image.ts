import { InvalidArgumentException, InvalidUrlException, RangeException } from '@/domain/errors'

export class Image {
  public static readonly MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  }

  public readonly name: string

  public constructor(
    public readonly url: string,
    public readonly contentType: string,
    public readonly size: number,
    name?: string,
  ) {
    this.validate()

    this.name = name ?? this.generateUniqueName()
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

  private getExtension(): string {
    const extension = Image.MIME_TO_EXTENSION[this.contentType]

    if (extension) return extension

    const url = new URL(this.url)
    const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/)
    return match ? match[1] : 'png'
  }

  private generateUniqueName(): string {
    return `${crypto.randomUUID()}.${this.getExtension()}`
  }

}
