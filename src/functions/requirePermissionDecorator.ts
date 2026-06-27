import { Forbidden, NotFoundError } from "#errors";
import { CommandPermissionTypeormRepository } from "#repositories";
import { ChatInputCommandInteraction } from "discord.js";

type interaction = ChatInputCommandInteraction<"cached">;
type commandRunner = (i: interaction) => Promise<void>;

const checkPermission = async (i: interaction) => {
  const commandName = i.command?.name
  if (!commandName) {
    throw new NotFoundError('Comando não encontrado')
  }

  if (i.memberPermissions.has('Administrator')) {
    return
  }

  const repository = new CommandPermissionTypeormRepository()

  const permissions = await repository.findByCommand(commandName)

  const memberRoles = i.member.roles.cache

  const hasPermission = permissions.some(p => {
    if (memberRoles.has(p.role)) {
      return true
    }

    return false
  })

  if (!hasPermission) {
    throw new Forbidden('Você não tem permissão para executar este comando')
  }
}

function requirePermissionDecorator(commandRunner: commandRunner) {
  const requirePermission = async (interaction: interaction) => {
    if (!interaction.isChatInputCommand()) {
      return
    }

    await checkPermission(interaction)

    await commandRunner(interaction)
  }

  return requirePermission
}

export { requirePermissionDecorator };
