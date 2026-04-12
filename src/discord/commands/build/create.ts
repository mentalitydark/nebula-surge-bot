import { requirePermissionDecorator } from '#functions'
import { createLabel, createModalFields, createTextInput } from '@magicyan/discord'
import { TextInputStyle } from 'discord.js'
import command from './build.js'

command.subcommand({
  name: 'create',
  description: 'Cria uma nova build',
  run: requirePermissionDecorator(async (interaction) => {
    const nameInput = createTextInput({
      customId: 'equipament',
      required: true,
      placeholder: 'Digite um ID único. Ex: Saryn Prime [Nuke] [End-Game]'
    })

    const contentInput = createTextInput({
      customId: 'content',
      required: true,
      placeholder: 'Uma mensagem que irá disponibilizar o link do Overframe da builda. Permite markdown',
      style: TextInputStyle.Paragraph
    })

    await interaction.showModal({
      customId: '/form/add-build',
      title: 'Adicionar build',
      components: createModalFields(
        createLabel("Identificador da build", nameInput),
        createLabel("Conteúdo da mensagem", contentInput)
      )
    })
  })
})