import { DeleteBuildUseCase } from '#application/use-cases/build/DeleteBuildUseCase.js'
import { requirePermissionDecorator } from '#functions'
import { BuildsTypeormRepository } from '#repositories'
import { ApplicationCommandOptionType } from 'discord.js'
import command from './build.js'

command.subcommand({
  name: 'remove',
  description: 'Remove uma build existente',
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
      const useCase = new DeleteBuildUseCase(repository)

      await useCase.execute(id)

      await interaction.reply({
        flags: ["Ephemeral"],
        content: `Build removida.`
      })
  })
})