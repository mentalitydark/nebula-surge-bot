import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
  public constructor(message: string) {
    super(message, 400)
    this.name = 'BadRequestError'
  }

}