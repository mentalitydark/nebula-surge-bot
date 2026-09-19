import { Exception } from './Exception'

export class InvalidArgumentException extends Exception {
  public constructor(message?: string) {
    super(message ?? 'Invalid argument')
  }
}
