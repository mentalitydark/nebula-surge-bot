import { createCommand } from "#base";
import { requirePermissionDecorator } from "#functions";
import { BuildsTypeormRepository } from "#repositories";
import { createLabel, createModalFields, createTextInput } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, TextInputStyle } from "discord.js";

createCommand({
    name: "update-build",
    description: "Abre o formulário para atualizar uma build já existente",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "identificador",
        description: "Identificador dado para a build",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    run: requirePermissionDecorator(async (interaction) => {
      const { options } = interaction

      const equipament = options.getString("identificador", true)

      const repository = new BuildsTypeormRepository()

      const build = await repository.findByEquipament(equipament)

      await interaction.showModal({
        customId: `/form/update-build/${build.id}`,
        title: 'Atualizar build',
        components: createModalFields(
          createLabel(
            "Identificador da build",
            createTextInput({
              customId: 'equipament',
              required: true,
              placeholder: 'Digite o nome do equipamento (warframe, arma e etc). Ex: Saryn Prime [Nuke] [End-Game]',
              value: build.equipament
            })
          ),
          createLabel(
            "Conteúdo da mensagem",
            createTextInput({
              customId: 'content',
              required: true,
              placeholder: 'Uma mensagem que irá disponibilizar o link do Overframe da builda. Permite markdown',
              style: TextInputStyle.Paragraph,
              value: build.content
            })
          )
        )
      })
    })
});