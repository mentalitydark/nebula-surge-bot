import { FindByGuildGuildSettingsUseCase } from "#application/use-cases/guild-settings/FindByGuildGuildSettingsUseCase.js"
import { GuildSettingsKeys, Settings } from "#entities"
import { BadRequestError } from "#errors"
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js"
import { GuildSettingsTypeormRepository } from "#repositories"
import { createEmbed } from "@magicyan/discord"
import { ApplicationCommandOptionType } from "discord.js"
import command from "./settings.js"

command.subcommand({
  name: "list",
  description: "Lista as configurações do servidor",
  options: [{
    name: "config",
    description: "Configuração",
    type: ApplicationCommandOptionType.String,
    required: false,
    choices: Object.values(GuildSettingsKeys).map((key) => ({
      name: Settings.getDescription(key),
      value: key,
    })),
  }],
  async run(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const key = interaction.options.getString("config") as GuildSettingsKeys | null

    if (key && Settings.isValidKey(key) === false) {
      throw new BadRequestError(`A configuração "${key}" não é válida.`)
    }

    const cache = InMemoryCacheProvider.getInstance('guild-settings:id')

    const repository = new GuildSettingsTypeormRepository()
    const useCase = new FindByGuildGuildSettingsUseCase(repository, cache)

    const guildSettings = await useCase.execute(interaction.guildId)

    if (!guildSettings || !guildSettings.settings) {
      throw new BadRequestError("Não foi possível encontrar as configurações do servidor.")
    }

    let embed;
    if (key) {
      const value = guildSettings.settings.get(key)
      if (!value) {
        throw new BadRequestError(`A configuração "${key}" não existe nas configurações do servidor.`)
      }

      embed = createEmbed({
        title: `Configuração: ${key}`,
        description: `Valor: ${Array.isArray(value) ? value.map(id => `<#${id}>`).join(", ") : `<#${value}>`}`,
        color: constants.colors.azoxo,
      })

    } else {
      embed = createEmbed({
        title: "Configurações do Servidor",
        description: Object.entries(guildSettings.settings.toJSON())
          .map(([k, v]) => `**${Settings.getDescription(k as GuildSettingsKeys)}**: ${v ? (Array.isArray(v) ? v.map(id => `<#${id}>`).join(", ") : `<#${v}>`) : "N/A"}`)
          .join("\n\n"),
        color: constants.colors.azoxo,
      })

    }

    await interaction.editReply({ embeds: [embed] })
  },
})