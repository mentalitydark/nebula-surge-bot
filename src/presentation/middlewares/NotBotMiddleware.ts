import { ButtonInteraction, ChannelSelectMenuInteraction, CommandInteraction, ContextMenuCommandInteraction, MentionableSelectMenuInteraction, ModalSubmitInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction, type Events, MessageReaction, VoiceState, Message } from 'discord.js'
import { type ArgsOf, type GuardFunction, SimpleCommandMessage } from 'discordx'

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
> = async (arg, _, next) => {
  const args = arg instanceof Array ? arg : [arg]
  const argObj = args[0]
  const secondary = args[1]
  const user =
    typeof secondary === 'object' && secondary !== null && 'bot' in secondary
      ? (secondary as { bot: boolean })
      : argObj instanceof CommandInteraction
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
                  argObj instanceof ContextMenuCommandInteraction ||
                  argObj instanceof MentionableSelectMenuInteraction ||
                  argObj instanceof ModalSubmitInteraction ||
                  argObj instanceof RoleSelectMenuInteraction ||
                  argObj instanceof StringSelectMenuInteraction ||
                  argObj instanceof UserSelectMenuInteraction
                  ? argObj.user
                  : undefined

  if (!user?.bot) {
    await next()
  }
}
