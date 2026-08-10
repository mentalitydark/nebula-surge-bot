export interface ILoggerProvider {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  success(message: string): void;
}