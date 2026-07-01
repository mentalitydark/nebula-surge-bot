import { SetGuildSettingsUseCase } from "#application/use-cases/guild-settings/SetGuildSettingsUseCase.js"
import { GuildSettingsKeys, Settings } from "#domain/entities/Settings.js"
import { BadRequestError } from "#errors"
import { GuildSettingsTypeormRepository } from "#repositories"
import { createEmbed } from "@magicyan/discord"
import { ApplicationCommandOptionType } from "discord.js"
import command from "./settings.js"

command.subcommand({
  name: 'set',
  description: 'Define o valor de uma configuração do bot',
  options: [{
    name: 'setting',
    description: 'Configuração que deseja alterar',
    type: ApplicationCommandOptionType.String,
    required: true,
    autocomplete: true
  }, {
    name: 'channel',
    description: 'Canal que deseja definir como valor da configuração',
    type: ApplicationCommandOptionType.Channel,
    required: true
  }],
  async run(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const settingOption = interaction.options.getString('setting', true) as GuildSettingsKeys
    const channelSelected = interaction.options.getChannel('channel', true)

    const guild = interaction.guild

    if (!guild) {
      throw new BadRequestError('Guild não encontrada')
    }

    if (!Settings.isValidKey(settingOption)) {
      throw new BadRequestError('Configuração inválida')
    }

    const repository = new GuildSettingsTypeormRepository()
    const useCase = new SetGuildSettingsUseCase(repository)

    await useCase.execute(guild.id, { [settingOption]: channelSelected.id })

    await interaction.editReply({
      embeds: [
        createEmbed({
          title: 'Configuração alterada',
          description: `A configuração **${Settings.getDescription(settingOption)}** foi alterada para o canal <#${channelSelected.id}>`,
          color: constants.colors.success
        })
      ]
    })
  }
})