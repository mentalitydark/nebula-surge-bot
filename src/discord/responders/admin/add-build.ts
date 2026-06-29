import { createResponder } from "#base";
import { DiscordUtils } from "#functions";
import { BuildsTypeormRepository } from "#repositories";
import { ResponderType } from "@constatic/base";

createResponder({
  customId: "/form/add-build",
  types: [ResponderType.Modal],
  cache: "cached",
  async run(interaction) {
    const { fields } = interaction

    const equipment = fields.getTextInputValue("equipment")
    const content = fields.getTextInputValue("content")

    const repository = new BuildsTypeormRepository()

    const build = repository.create({ equipment, content })

    await repository.conflictingEquipment(equipment)

    const saveResult = await repository.insert(build)

    await interaction.reply({
      flags: ["Ephemeral"],
      content: `Build \`${saveResult.equipment}\` criada em ${DiscordUtils.formatTimestamp(saveResult.createdAt)}`
    })
  },
});