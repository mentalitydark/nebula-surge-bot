import { FindBuildByIdUseCase } from '#application/use-cases/build/FindBuildByIdUseCase.js'
import { requirePermissionDecorator } from '#functions'
import { BuildsTypeormRepository } from '#repositories'
import { createLabel, createModalFields, createTextInput } from '@magicyan/discord'
import { ApplicationCommandOptionType, TextInputStyle } from 'discord.js'
import command from './build.js'

command.subcommand({
  name: 'update',
  description: 'Atualiza uma build existente',
  options: [{
    name: 'id',
    description: 'ID da build a ser atualizada',
    type: ApplicationCommandOptionType.Integer,
    required: true
  }],
  run: requirePermissionDecorator(async (interaction) => {
    const { options } = interaction
    const id = options.getInteger("id", true)

    const repository = new BuildsTypeormRepository()
    const useCase = new FindBuildByIdUseCase(repository)

    const build = await useCase.execute(id)

    const nameInput = createTextInput({
      customId: 'equipment',
      required: true,
      placeholder: 'Digite um ID único. Ex: Saryn Prime [Nuke] [End-Game]',
      value: build.equipment
    })

    const contentInput = createTextInput({
      customId: 'content',
      required: true,
      placeholder: 'Uma mensagem que irá disponibilizar o link do Overframe da builda. Permite markdown',
      style: TextInputStyle.Paragraph,
      value: build.content
    })

    await interaction.showModal({
      customId: `/form/update-build/${build.id}`,
      title: 'Atualizar build',
      components: createModalFields(
        createLabel("Identificador da build", nameInput),
        createLabel("Conteúdo da mensagem", contentInput)
      )
    })
  })
})