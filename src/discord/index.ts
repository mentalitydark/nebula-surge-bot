import { setupCreators } from "@constatic/base";
import { onError } from "./onError.js";

const setup = setupCreators({
  commands: { onError },
  responders: { onError }
})

const { createCommand: originalCreateCommand, createEvent, createResponder } = setup;

export const registeredCommands: Map<string, string> = new Map();

const createCommand: typeof originalCreateCommand = (data) => {
  if (Array.isArray(data.defaultMemberPermissions) && !data.defaultMemberPermissions.includes("Administrator")) {
    registeredCommands.set(data.name, data.name);
  } else if (!Array.isArray(data.defaultMemberPermissions)) {
    registeredCommands.set(data.name, data.name);
  }

  return originalCreateCommand({...data, dmPermission: false})
}

export { createCommand, createEvent, createResponder };
