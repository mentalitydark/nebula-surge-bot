import { createResponder } from "#base";
import { DiscordUtils } from "#functions";
import { BuildsTypeormRepository } from "#repositories";
import { ResponderType } from "@constatic/base";

createResponder({
    customId: "/form/update-build/:buildId",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction, { buildId }) {
      const { fields } = interaction
      
      const equipament = fields.getTextInputValue("equipament")
      const content = fields.getTextInputValue("content")

      const repository = new BuildsTypeormRepository()
      
      const build = repository.create({ equipament, content })

      await repository.conflitingEquipament(equipament)

      const saveResult = await repository.update({ ...build, id: Number(buildId) })

      await interaction.reply({
        flags: ["Ephemeral"],
        content: `Build \`${saveResult.equipament}\` atualizada em ${DiscordUtils.formatTimestamp(saveResult.updatedAt ?? saveResult.createdAt)}`
      })
    },
});