import { Exception } from './Exception'

export class NotFoundException extends Exception {
  public constructor(message: string) {
    super(message)
    this.name = 'NotFoundException'
  }
}
