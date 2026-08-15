import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";
import { GuardFunction } from "discordx";
import { colors } from "../constants";
import { Exception } from "@/domain/errors";

export const OnErrorChatInputCommandInteractionMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, _, next) => {
  try {
    await next();
  } catch (error) {
    if (!(interaction instanceof ChatInputCommandInteraction)) {
      throw error;
    }

    const isException = error instanceof Exception;
    const isReplyOrDeferred = interaction.replied || interaction.deferred;
    const method = isReplyOrDeferred ? "followUp" : "reply";

    if (isException) {
      await interaction[method]({
        flags: ['Ephemeral'],
        embeds: [createEmbed({
          title: "Erro",
          description: error.message,
          color: colors.danger
        })]
      });
      return;
    }

    await interaction[method]({
      flags: ['Ephemeral'],
      embeds: [createEmbed({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        color: colors.danger
      })]
    });

    throw error;
  }
}