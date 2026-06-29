import { setupCreators } from "@constatic/base";
import { onError } from "./onError.js";

const setup = setupCreators({
  commands: { onError },
  responders: { onError }
})

const { createCommand: originalCreateCommand, createEvent, createResponder } = setup;

export const registeredCommands: Map<string, string> = new Map();

const createCommand: typeof originalCreateCommand = (commandData) => {
  const hasRunFunction = !!commandData.run && typeof commandData.run === 'function';
  const withoutDefaultPermissions = !Array.isArray(commandData.defaultMemberPermissions)

  if (hasRunFunction && commandData.run!.name === 'requirePermission') {
    registeredCommands.set(commandData.name, commandData.name)
  } else if (hasRunFunction && withoutDefaultPermissions) {
    registeredCommands.set(commandData.name, commandData.name)
  }

  const command = originalCreateCommand(commandData);
  const originalSubcommand = command.subcommand;

  Object.defineProperty(command, "subcommand", {
    value: function (subcommandData: Parameters<typeof command['subcommand']>[0]) {
      const hasRunFunction = !!subcommandData.run && typeof subcommandData.run === 'function';

      if (hasRunFunction && subcommandData.run!.name === 'requirePermission') {
        registeredCommands.set(`${commandData.name}/${subcommandData.name}`, `${commandData.name}/${subcommandData.name}`)
      }

      return originalSubcommand.call(this, subcommandData);
    }
  })

  return command
}

export { createCommand, createEvent, createResponder };

