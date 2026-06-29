import { MessageLocatorInput, MessageLocatorResult, MessageLocatorStrategy } from "#domain/strategies/MessageLocatorStrategy.js";
import { BadRequestError } from "#errors";

/**
 * Context do Strategy Pattern
 * Gerencia múltiplas estratégias de localização de mensagens
 */
export class MessageLocatorContext {
  private strategies: MessageLocatorStrategy[] = [];

  constructor(strategies: MessageLocatorStrategy[]) {
    this.strategies = strategies;
  }

  /**
   * Adiciona uma nova estratégia
   */
  addStrategy(strategy: MessageLocatorStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Localiza a mensagem usando a primeira estratégia compatível
   */
  async locate(data: MessageLocatorInput): Promise<MessageLocatorResult> {
    const strategy = this.strategies.find(s => s.canHandle(data.input));

    if (!strategy) {
      throw new BadRequestError(
        `Formato de identificação inválido: \`${data.input}\`\n\n` +
        `Formatos aceitos:\n` +
        `• \`MENSAGEM_ID\` - Busca em todos os canais\n` +
        `• \`CANAL_ID-MENSAGEM_ID\` - Busca direta no canal específico`
      );
    }

    return strategy.locate(data);
  }
}
