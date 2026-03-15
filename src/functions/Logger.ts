import clc from "cli-color"

export class Logger {
  private static getFormattedDate(): string {
    return new Date().toLocaleTimeString('pt-BR')
  }

  public static log(message: string) {
    console.log(`[LOG] ${this.getFormattedDate()} - ${message}`)
  }

  public static info(message: string) {
    console.log(`[${clc.blue('INFO')}] ${this.getFormattedDate()} - ${message}`)
  }

  public static error(message: string) {
    console.log(`[${clc.red('ERROR')}] ${this.getFormattedDate()} - ${message}`)
  }

  public static warn(message: string) {
    console.log(`[${clc.yellow('WARN')}] ${this.getFormattedDate()} - ${message}`)
  }

  public static green(message: string) {
    console.log(clc.green(message))
  }

  public static blue(message: string) {
    console.log(clc.blue(message))
  }

  public static red(message: string) {
    console.log(clc.red(message))
  }

  public static yellow(message: string) {
    console.log(clc.yellow(message))
  }

}