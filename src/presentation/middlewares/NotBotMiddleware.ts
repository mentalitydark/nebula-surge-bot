import { ButtonInteraction, ChannelSelectMenuInteraction, CommandInteraction, ContextMenuCommandInteraction, MentionableSelectMenuInteraction, ModalSubmitInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction, Events, MessageReaction, VoiceState, Message } from "discord.js";
import { ArgsOf, GuardFunction, SimpleCommandMessage } from "discordx";

export const NotBotMiddleware: GuardFunction<
  | ArgsOf<
    Events.MessageCreate | Events.MessageReactionAdd | Events.VoiceStateUpdate
  >
  | ButtonInteraction
  | ChannelSelectMenuInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | MentionableSelectMenuInteraction
  | ModalSubmitInteraction
  | RoleSelectMenuInteraction
  | StringSelectMenuInteraction
  | UserSelectMenuInteraction
  | SimpleCommandMessage
> = async (arg, client, next) => {
  const argObj = arg instanceof Array ? arg[0] : arg;
  const user =
    argObj instanceof CommandInteraction
      ? argObj.user
      : argObj instanceof MessageReaction
        ? argObj.message.author
        : argObj instanceof VoiceState
          ? argObj.member?.user
          : argObj instanceof Message
            ? argObj.author
            : argObj instanceof SimpleCommandMessage
              ? argObj.message.author
              : argObj instanceof ButtonInteraction ||
                argObj instanceof ChannelSelectMenuInteraction ||
                argObj instanceof CommandInteraction ||
                argObj instanceof ContextMenuCommandInteraction ||
                argObj instanceof MentionableSelectMenuInteraction ||
                argObj instanceof ModalSubmitInteraction ||
                argObj instanceof RoleSelectMenuInteraction ||
                argObj instanceof StringSelectMenuInteraction ||
                argObj instanceof UserSelectMenuInteraction
                ? argObj.member?.user
                : argObj.message.author;

  if (!user?.bot) {
    await next();
  }
};