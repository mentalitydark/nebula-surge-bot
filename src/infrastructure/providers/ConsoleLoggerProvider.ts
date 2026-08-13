import { LoggerProviderInterface } from "@/application/providers";
import { styleText } from "node:util";

export class ConsoleLoggerProvider implements LoggerProviderInterface {
  public constructor(
    private readonly console: Console
  ) { }

  public static create(): ConsoleLoggerProvider {
    return new ConsoleLoggerProvider(console);
  }

  public log(message: string): void {
    const tag = this.createTag('log');

    this.console.log(`${styleText('gray', tag)} ${message}`);
  }

  public error(message: string | Error): void {
    const tag = this.createTag('error');
    if (message instanceof Error) {
      this.console.error(tag, message);
    } else {
      this.console.error(`${styleText('red', tag)} ${message}`);
    }
  }

  public warn(message: string): void {
    const tag = this.createTag('warn');
    this.console.log(`${styleText('yellow', tag)} ${message}`);
  }

  public info(message: string): void {
    const tag = this.createTag('info');
    this.console.log(`${styleText('blue', tag)} ${message}`);
  }

  public success(message: string): void {
    const tag = this.createTag('success');
    this.console.log(`${styleText('green', tag)} ${message}`);
  }

  private createTag(message: string): string {
    const now = new Date();
    return `[${now.toISOString()}] [${message.toUpperCase()}]`;
  }
}