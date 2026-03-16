import { createCommand } from "#base";
import { createLabel, createModalFields, createTextInput } from "@magicyan/discord";
import { ApplicationCommandType, TextInputStyle } from "discord.js";

createCommand({
    name: "add-build",
    description: "Abre o formulário para enviar uma build",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    async run(interaction) {
      await interaction.showModal({
        customId: '/form/add-build',
        title: 'Adicionar build',
        components: createModalFields(
          createLabel(
            "Identificador da build",
            createTextInput({ customId: 'equipament', required: true, placeholder: 'Warframe, Arma ou Companheiro...'})
          ),
          createLabel(
            "Conteúdo da mensagem",
            createTextInput({
              customId: 'content',
              required: true,
              placeholder: 'Um breve texto que será enviando ao pesquisar a build. Utilizar o link do overframe por enquanto',
              style: TextInputStyle.Paragraph
            })
          )
        )
      })
    }
});