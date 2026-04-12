import { AppError } from "./AppError.js";

export class Forbidden extends AppError {
  public constructor(message: string) {
    super(message, 403)
    this.name = 'Forbidden'
  }
}