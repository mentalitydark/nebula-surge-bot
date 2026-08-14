import { rolesId } from "@/infrastructure/config";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { GuardFunction } from "discordx";
import { Exception, LogicException, ForbiddenException } from "@/domain/errors";

export const StaffOnlyMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, client, next) => {
  const isCommand = interaction instanceof ChatInputCommandInteraction;
  if (!isCommand) {
    throw new LogicException();
  }

  const member = interaction.member;
  if (!(member instanceof GuildMember)) {
    throw new Exception('Member is not a GuildMember');
  }

  const isStaff = member.roles.cache.some(role => role.id === rolesId.executor) || member.permissions.has("Administrator");
  if (!isStaff) {
    throw new ForbiddenException();
  }

  await next();
}