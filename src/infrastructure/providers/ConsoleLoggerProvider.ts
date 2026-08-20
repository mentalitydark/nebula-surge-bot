import { LoggerProviderInterface } from "@/application/providers";
import { styleText } from "node:util";
import { injectable } from "tsyringe";

@injectable()
export class ConsoleLoggerProvider implements LoggerProviderInterface {
  public constructor(
    private readonly console: Console = global.console
  ) { }

  public log(...message: string[]): void {
    const tag = this.createTag('log');
    for (const msg of message) {
      this.console.log(`${styleText('gray', tag)} ${msg}`);
    }
  }

  public error(...message: (string | Error)[]): void {
    const tag = this.createTag('error');
    for (const msg of message) {
      if (msg instanceof Error) {
        this.console.error(tag, msg);
      } else {
        this.console.error(`${styleText('red', tag)} ${msg}`);
      }
    }
  }

  public warn(...message: string[]): void {
    const tag = this.createTag('warn');
    for (const msg of message) {
      this.console.log(`${styleText('yellow', tag)} ${msg}`);
    }
  }

  public info(...message: string[]): void {
    const tag = this.createTag('info');
    for (const msg of message) {
      this.console.log(`${styleText('blue', tag)} ${msg}`);
    }
  }

  public success(...message: string[]): void {
    const tag = this.createTag('success');
    for (const msg of message) {
      this.console.log(`${styleText('green', tag)} ${msg}`);
    }
  }

  private createTag(message: string): string {
    const now = new Date();
    return `[${now.toISOString()}] [${message.toUpperCase()}]`;
  }
}