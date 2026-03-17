import { createCommand } from "#base";
import { createLabel, createModalFields, createTextInput } from "@magicyan/discord";
import { ApplicationCommandType, TextInputStyle } from "discord.js";

createCommand({
    name: "add-build",
    description: "Abre o formulário para adicionar uma nova build",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    async run(interaction) {
      await interaction.showModal({
        customId: '/form/add-build',
        title: 'Adicionar build',
        components: createModalFields(
          createLabel(
            "Identificador da build",
            createTextInput({
              customId: 'equipament',
              required: true,
              placeholder: 'Digite um ID único. Ex: Saryn Prime [Nuke] [End-Game]'
            })
          ),
          createLabel(
            "Conteúdo da mensagem",
            createTextInput({
              customId: 'content',
              required: true,
              placeholder: 'Uma mensagem que irá disponibilizar o link do Overframe da builda. Permite markdown',
              style: TextInputStyle.Paragraph
            })
          )
        )
      })
    }
});