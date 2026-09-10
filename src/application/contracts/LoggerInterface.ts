export interface LoggerInterface {
  log(...message: string[]): void;
  error(...message: (string | Error)[]): void;
  warn(...message: string[]): void;
  info(...message: string[]): void;
  success(...message: string[]): void;
}
