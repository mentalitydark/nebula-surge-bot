import { Exception } from './Exception'

export class InvalidUrlException extends Exception {
  public constructor(url: string) {
    super(`URL inválida: ${url}`)
  }
}
