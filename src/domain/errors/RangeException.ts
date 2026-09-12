import { Exception } from './Exception'

export class RangeException extends Exception {
  public constructor(message: string) {
    super(message)
  }
}
