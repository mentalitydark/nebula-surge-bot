import { Guild, Message } from "discord.js";

export type MessageLocatorInput = {
  input: string;
  guild: Guild;
}

export type MessageLocatorResult = {
  message: Message;
  channelId: string;
}

export interface MessageLocatorStrategy {
  /**
   * Verifica se a estratégia pode lidar com o input fornecido
   */
  canHandle(input: string): boolean;

  /**
   * Localiza a mensagem baseado no input
   * @throws {Error} Se a mensagem não for encontrada
   */
  locate(data: MessageLocatorInput): Promise<MessageLocatorResult>;
}
