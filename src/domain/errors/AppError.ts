export class AppError extends Error {
  public readonly statusCode: number

  public constructor(message: string, statusCode: number = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }

  public static isAppError<T extends AppError>(this: new (...args: any[]) => T, error: any): error is T {
    return error instanceof this
  }

}