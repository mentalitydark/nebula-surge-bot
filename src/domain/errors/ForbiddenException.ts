import { Exception } from './Exception'

export class ForbiddenException extends Exception {
  public constructor(customMessage?: string) {
    super(customMessage ?? 'Acesso negado: você não tem permissão para executar esta ação.')
    this.name = 'ForbiddenException'
  }
}
