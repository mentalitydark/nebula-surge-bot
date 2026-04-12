import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  public constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }

  public override get statusCode(): number {
    return 409
  }

  public override get errorName(): string {
    return 'Conflito de dados'
  }

}