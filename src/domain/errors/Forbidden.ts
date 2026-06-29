import { AppError } from "./AppError.js";

export class Forbidden extends AppError {
  public constructor(message: string) {
    super(message)
    this.name = 'Forbidden'
  }

  public override get statusCode(): number {
    return 403
  }

  public override get errorName(): string {
    return 'Acesso negado'
  }

}