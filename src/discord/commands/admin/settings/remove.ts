import { SetGuildSettingsUseCase } from "#application/use-cases/guild-settings/SetGuildSettingsUseCase.js"
import { GuildSettingsKeys, Settings } from "#entities"
import { BadRequestError } from "#errors"
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js"
import { GuildSettingsTypeormRepository } from "#repositories"
import { createEmbed } from "@magicyan/discord"
import { ApplicationCommandOptionType } from "discord.js"
import command from "./settings.js"

command.subcommand({
  name: 'remove',
  description: 'Remove o valor de uma configuração do bot',
  options: [{
    name: 'setting',
    description: 'Configuração que deseja remover',
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: Object.values(GuildSettingsKeys).map((key) => ({
      name: Settings.getDescription(key),
      value: key,
    }))
  }],
  async run(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const settingOption = interaction.options.getString('setting', true) as GuildSettingsKeys

    const guild = interaction.guild

    if (!guild) {
      throw new BadRequestError('Guild não encontrada')
    }

    if (!Settings.isValidKey(settingOption)) {
      throw new BadRequestError('Configuração inválida')
    }

    const cache = InMemoryCacheProvider.getInstance<'guild-settings:id'>('guild-settings:id')

    const repository = new GuildSettingsTypeormRepository()
    const useCase = new SetGuildSettingsUseCase(repository, cache)

    await useCase.execute(guild.id, { [settingOption]: null })

    await interaction.editReply({
      embeds: [
        createEmbed({
          title: 'Configuração removida',
          description: `A configuração **${Settings.getDescription(settingOption)}** foi removida`,
          color: constants.colors.success
        })
      ]
    })
  }
})