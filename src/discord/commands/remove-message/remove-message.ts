import { FindGuildSettingsByGuildIdUseCase } from "#application/use-cases/guild-settings/FindGuildSettingsByGuildIdUseCase.js";
import { RemoveMessageUseCase } from "#application/use-cases/message/RemoveMessageUseCase.js";
import { createCommand } from "#base";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError, NotFoundError } from "#errors";
import { requirePermissionDecorator } from "#functions";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { ChannelMessageIdLocatorStrategy, MessageIdLocatorStrategy, MessageLocatorContext } from "#infrastructure/strategies/index.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

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

    const messageIdentifier = interaction.options.getString("message-id", true).trim();
    if (!messageIdentifier) {
      throw new BadRequestError("ID de mensagem não pode ser vazio");
    }

    const { guild, user } = interaction;
    if (!guild) {
      throw new BadRequestError("Guild não encontrada");
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id');

    const findByGuildGuildSettingsUseCase = new FindGuildSettingsByGuildIdUseCase(new GuildSettingsTypeormRepository(), cache);

    const guildSettings = await findByGuildGuildSettingsUseCase.execute(guild.id);
    if (!guildSettings.settings) {
      throw new NotFoundError("Configurações do guild não encontradas");
    }

    const channelMessagesRemoved = guildSettings.settings.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED);
    if (!channelMessagesRemoved) {
      throw new NotFoundError(`\`${Settings.getDescription(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED)}\` não está definido`);
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
      historyChannelId: channelMessagesRemoved
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
