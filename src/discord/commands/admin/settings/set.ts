import { SetGuildSettingsUseCase } from "#application/use-cases/guild-settings/SetGuildSettingsUseCase.js"
import { GuildSettingsKeys, Settings } from "#entities"
import { BadRequestError } from "#errors"
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js"
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
    choices: Object.values(GuildSettingsKeys).map((key) => ({
      name: Settings.getDescription(key),
      value: key,
    }))
  }, {
    name: 'value',
    description: 'Canal, Cargo ou Valor que deseja definir para a configuração.',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  async run(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const settingOption = interaction.options.getString('setting', true) as GuildSettingsKeys
    const value = interaction.options.getString('value', true)

    const guild = interaction.guild

    if (!guild) {
      throw new BadRequestError('Guild não encontrada')
    }

    if (!Settings.isValidKey(settingOption)) {
      throw new BadRequestError('Configuração inválida')
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id')

    const repository = new GuildSettingsTypeormRepository()
    const useCase = new SetGuildSettingsUseCase(repository, cache)

    const mentions = parseMentions(value)
    const parsedValue: string | string[] = mentions.length ? mentions : value

    await useCase.execute(settingOption, parsedValue, guild)

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Configuração alterada',
        description: `A configuração **${Settings.getDescription(settingOption)}** foi alterada para "${value}".`,
        color: constants.colors.success
      })]
    })
  }
})

function parseMentions(value: string): string[] {
  const mentionRegex = /<[#@][&!]?\d+>/g

  return value.match(mentionRegex) ?? []
}