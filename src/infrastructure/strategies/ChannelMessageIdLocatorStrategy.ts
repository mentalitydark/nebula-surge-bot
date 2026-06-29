import { MessageLocatorInput, MessageLocatorResult, MessageLocatorStrategy } from "#domain/strategies/MessageLocatorStrategy.js";
import { NotFoundError } from "#errors";
import { TextChannel } from "discord.js";

/**
 * Estratégia para localizar mensagens usando o formato: CANAL_ID-MENSAGEM_ID
 */
export class ChannelMessageIdLocatorStrategy implements MessageLocatorStrategy {
  private readonly pattern = /^(\d+)-(\d+)$/;

  canHandle(input: string): boolean {
    return this.pattern.test(input);
  }

  async locate(data: MessageLocatorInput): Promise<MessageLocatorResult> {
    const match = data.input.match(this.pattern);

    if (!match) {
      throw new NotFoundError("Formato inválido. Use: CANAL_ID-MENSAGEM_ID");
    }

    const [, channelId, messageId] = match;

    const channel = await data.guild.channels.fetch(channelId).catch(() => null);

    if (!channel || !(channel instanceof TextChannel)) {
      throw new NotFoundError(`Canal \`${channelId}\` não encontrado ou não é um canal de texto`);
    }

    const message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
      throw new NotFoundError(`Mensagem \`${messageId}\` não encontrada no canal <#${channelId}>`);
    }

    return {
      message,
      channelId
    };
  }
}
