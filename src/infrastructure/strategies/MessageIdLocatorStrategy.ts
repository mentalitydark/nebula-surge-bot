import { MessageLocatorInput, MessageLocatorResult, MessageLocatorStrategy } from "#domain/strategies/MessageLocatorStrategy.js";
import { NotFoundError } from "#errors";
import { TextChannel } from "discord.js";

/**
 * Estratégia para localizar mensagens procurando apenas pelo ID em todos os canais
 */
export class MessageIdLocatorStrategy implements MessageLocatorStrategy {
  private readonly pattern = /^\d+$/;

  canHandle(input: string): boolean {
    return this.pattern.test(input);
  }

  async locate(data: MessageLocatorInput): Promise<MessageLocatorResult> {
    const messageId = data.input;

    const channels = await data.guild.channels.fetch();

    for (const [, channel] of channels) {
      if (!channel || !(channel instanceof TextChannel)) {
        continue;
      }

      const message = await channel.messages.fetch(messageId).catch(() => null);

      if (message) {
        return {
          message,
          channelId: channel.id
        };
      }
    }

    throw new NotFoundError(`Mensagem \`${messageId}\` não encontrada em nenhum canal`);
  }
}
