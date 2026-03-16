import { createCommand } from "#base";
import { dataSource, entities } from "#database";
import { createLabel, createModalFields, createTextInput } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, TextInputStyle } from "discord.js";

createCommand({
    name: "update-build",
    description: "Abre o formulário para atualizar uma build",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
      {
        name: "equipamento",
        description: "Warframe, arma ou companheiro...",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    async run(interaction) {
      const { options } = interaction

      const equipament = options.getString("equipamento", true)

      const repository = dataSource.getRepository(entities.Builds)

      const build = await repository.findOneBy({ equipament })

      if (!build) {
        throw new Error(`Build \`${equipament}\` não encontrada.`)
      }

      await interaction.showModal({
        customId: `/form/update-build/${build.id}`,
        title: 'Atualizar build',
        components: createModalFields(
          createLabel(
            "Identificador da build",
            createTextInput({
              customId: 'equipament',
              required: true,
              placeholder: 'Warframe, Arma ou Companheiro...',
              value: build.equipament
            })
          ),
          createLabel(
            "Conteúdo da mensagem",
            createTextInput({
              customId: 'content',
              required: true,
              placeholder: 'Um breve texto que será enviando ao pesquisar a build. Utilizar o link do overframe por enquanto',
              style: TextInputStyle.Paragraph,
              value: build.content
            })
          )
        )
      })
    }
});