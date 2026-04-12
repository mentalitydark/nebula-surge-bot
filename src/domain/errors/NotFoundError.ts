import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  public constructor(message: string) {
    super(message)
    this.name = 'NotFound'
  }

  public override get statusCode(): number {
    return 404
  }

  public override get errorName(): string {
    return 'Recurso não encontrado'
  }

}