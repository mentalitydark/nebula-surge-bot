import { AttachmentBuilder, channelMention, Events, Guild, PermissionFlagsBits, TextChannel, time, TimestampStyles } from "discord.js";
import { Discord, Guard, On, type ArgsOf } from "discordx";
import { NotBotMiddleware } from "@/presentation/middlewares";
import { channelsId, rolesId } from "@/infrastructure/config";
import { createEmbed } from "@magicyan/discord";
import { colors } from "@/presentation/constants";
import { userMention } from "discord.js";

@Discord()
export class RemoveMessage {
  private channelMessagesRemoved: TextChannel | null = null;

  @On({ event: Events.MessageCreate })
  @Guard(NotBotMiddleware)
  public async onMessageCreate([message]: ArgsOf<Events.MessageCreate>): Promise<void> {
    if (message.content !== "!remove" || !message.member || !message.guild || !message.reference || !message.reference.messageId) return;

    const { member } = message;

    let hasPermission = false;
    member.roles.cache.forEach(role => {
      if (role.id === rolesId.executor || role.permissions.has(PermissionFlagsBits.Administrator)) {
        hasPermission = true;
      }
    })

    if (!hasPermission) {
      await message.reply("Você não tem permissão para usar este comando.");
      return;
    }

    const messageTarget = await message.channel.messages.fetch(message.reference.messageId);
    if (!messageTarget) return;

    const channelMessagesRemoved = await this.getChannelMessagesRemoved(message.guild);
    if (!channelMessagesRemoved) return;

    await channelMessagesRemoved.send({
      content: `Mensagem original de ${userMention(messageTarget.author.id)}:`,
      embeds: [createEmbed({
        title: "Mensagem removida",
        description: message.content || "*Sem conteúdo de texto*",
        color: colors.danger,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "👤 Autor", value: `${messageTarget.author}`, inline: true },
          { name: "📌 Canal de origem", value: channelMention(messageTarget.channelId), inline: true },
          { name: "🛡️ Ocultada por", value: `${message.author}`, inline: true },
          { name: "📅 Enviada em", value: time(messageTarget.createdAt, TimestampStyles.ShortDateShortTime), inline: true },
          { name: "🕐 Ocultada em", value: time(new Date(), TimestampStyles.ShortDateShortTime), inline: true },
        ],
      })]
    })

    if (messageTarget.attachments.size > 0) {
      const attachmentFiles: Record<string, AttachmentBuilder> = {};

      await Promise.allSettled(messageTarget.attachments.map(async (attachment) => {
        try {
          const response = await fetch(attachment.url);
          if (!response.ok) {
            return;
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          const attachmentFile = new AttachmentBuilder(buffer, { name: attachment.name });
          attachmentFiles[attachment.url] = attachmentFile;
        } catch (error) {
          return;
        }
      }));

      if (Object.keys(attachmentFiles).length > 0) {
        await channelMessagesRemoved.send({
          content: `Anexos de ${userMention(messageTarget.author.id)}:`,
          files: Object.values(attachmentFiles)
        });
      }
    }

    const deleted = await messageTarget.delete();
    if (deleted) {
      await message.delete();
    }
  }

  private async getChannelMessagesRemoved(guild: Guild) {
    if (!this.channelMessagesRemoved) {
      const channel = await guild.channels.fetch(channelsId.messagesRemoved);
      if (channel && channel.isTextBased()) {
        this.channelMessagesRemoved = channel as TextChannel;
      }
    }

    return this.channelMessagesRemoved;
  }

}