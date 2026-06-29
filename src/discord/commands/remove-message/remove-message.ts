import { RemoveMessageUseCase } from "#application/use-cases/message/RemoveMessageUseCase.js";
import { createCommand } from "#base";
import { BadRequestError, NotFoundError } from "#errors";
import { requirePermissionDecorator } from "#functions";
import { ChannelMessageIdLocatorStrategy, MessageIdLocatorStrategy, MessageLocatorContext } from "#infrastructure/strategies/index.js";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

const CHANNEL_HISTORY_ID = process.env.CHANNEL_HISTORY_ID;

createCommand({
  name: "remove-message",
  description: "Remove uma mensagem do canal",
  type: ApplicationCommandType.ChatInput,
  options: [{
    name: "message-id",
    description: "ID da mensagem (MENSAGEM_ID) ou canal e mensagem (CANAL_ID-MENSAGEM_ID)",
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  run: requirePermissionDecorator(async (interaction) => {
    await interaction.deferReply({ flags: ['Ephemeral'] });

    if (!CHANNEL_HISTORY_ID) {
      throw new NotFoundError("`CHANNEL_HISTORY_ID` não está definido");
    }

    const messageIdentifier = interaction.options.getString("message-id", true).trim();

    if (!messageIdentifier) {
      throw new BadRequestError("ID de mensagem não pode ser vazio");
    }

    const { guild, user } = interaction;

    if (!guild) {
      throw new BadRequestError("Guild não encontrada");
    }

    const messageLocatorContext = new MessageLocatorContext([
      new ChannelMessageIdLocatorStrategy(),
      new MessageIdLocatorStrategy()
    ]);

    const useCase = new RemoveMessageUseCase(messageLocatorContext);

    await useCase.execute({
      messageIdentifier,
      guild,
      removedBy: user,
      historyChannelId: CHANNEL_HISTORY_ID
    });

    await interaction.editReply({
      embeds: [
        createEmbed({
          title: "✅ Sucesso",
          description: "Mensagem removida com sucesso e salva no histórico.",
          color: constants.colors.success
        })
      ]
    });
  })
});
