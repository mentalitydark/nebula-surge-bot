import { NotFoundError } from "#errors";
import { MessageLocatorContext } from "#infrastructure/strategies/MessageLocatorContext.js";
import { createEmbed } from "@magicyan/discord";
import { AttachmentBuilder, Guild, Message, TextChannel, User } from "discord.js";

export type RemoveMessageInput = {
  messageIdentifier: string;
  guild: Guild;
  removedBy: User;
  historyChannelId: string;
}

export type RemoveMessageOutput = {
  deletedMessage: {
    content: string;
    author: string;
    channelId: string;
    createdAt: Date;
  }
}

export class RemoveMessageUseCase {
  constructor(
    private readonly messageLocatorContext: MessageLocatorContext
  ) { }

  async execute(input: RemoveMessageInput): Promise<RemoveMessageOutput> {
    const { message, channelId } = await this.messageLocatorContext.locate({
      input: input.messageIdentifier,
      guild: input.guild
    });

    const historyChannel = await this.validateHistoryChannel(input.guild, input.historyChannelId);

    await this.saveToHistory(message, historyChannel, input.removedBy);

    await message.delete();

    return {
      deletedMessage: {
        content: message.content,
        author: message.author.username,
        channelId,
        createdAt: message.createdAt
      }
    };
  }

  private async validateHistoryChannel(guild: Guild, historyChannelId: string): Promise<TextChannel> {
    const channel = await guild.channels.fetch(historyChannelId).catch(() => null);

    if (!channel || !(channel instanceof TextChannel)) {
      throw new NotFoundError("Canal de histórico não encontrado ou não é um canal de texto");
    }

    return channel;
  }

  private async saveToHistory(message: Message, historyChannel: TextChannel, removedBy: User): Promise<void> {
    await historyChannel.send({
      content: `Mensagem original de ${message.author.username}:`,
      embeds: [createEmbed({
        title: "Mensagem removida",
        description: message.content || "*Sem conteúdo de texto*",
        color: constants.colors.danger,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "👤 Autor", value: `${message.author}`, inline: true },
          { name: "📌 Canal de origem", value: `<#${message.channelId}>`, inline: true },
          { name: "🛡️ Ocultada por", value: `${removedBy}`, inline: true },
          { name: "📅 Enviada em", value: `<t:${Math.floor(message.createdAt.getTime() / 1000)}:F>`, inline: true },
          { name: "🕐 Ocultada em", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        ],
      })]
    });

    if (message.attachments.size > 0) {
      await this.saveAttachments(message, historyChannel);
    }
  }

  private async saveAttachments(message: Message, historyChannel: TextChannel): Promise<void> {
    const attachmentFiles: AttachmentBuilder[] = [];

    for (const [, attachment] of message.attachments) {
      const response = await fetch(attachment.url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const file = new AttachmentBuilder(buffer, { name: attachment.name });
      attachmentFiles.push(file);
    }

    if (attachmentFiles.length > 0) {
      await historyChannel.send({
        content: `Anexos de \`${message.author.username}\`:`,
        files: attachmentFiles
      });
    }
  }
}
