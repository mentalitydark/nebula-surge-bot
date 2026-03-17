import { setupCreators } from "@constatic/base";
import { onError } from "./onError.js";

const setup = setupCreators({
  commands: { onError },
  responders: { onError }
})

export const { createCommand, createEvent, createResponder } = setup;