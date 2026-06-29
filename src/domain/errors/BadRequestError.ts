import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
  public constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
  }

  public override get statusCode(): number {
    return 400
  }

  public override get errorName(): string {
    return 'Requisição inválida'
  }

}