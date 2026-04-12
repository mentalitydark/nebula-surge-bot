export abstract class AppError extends Error {
  public constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
  
  public abstract get statusCode(): number
  public abstract get errorName(): string

}