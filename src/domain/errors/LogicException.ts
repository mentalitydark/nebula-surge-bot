import { Exception } from "./Exception";

export class LogicException extends Exception {
  public constructor() {
    super('Erro de lógica: uma operação inválida foi realizada.');
    this.name = 'LogicException';
  }
}