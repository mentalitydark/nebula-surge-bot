import { rolesId } from "@/infrastructure/config";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { GuardFunction } from "discordx";
import { Exception, LogicException, ForbiddenException } from "@/domain/errors";

export const StaffOnlyMiddleware: GuardFunction<ChatInputCommandInteraction> = async (interaction, client, next) => {
  if (!(interaction instanceof ChatInputCommandInteraction)) {
    throw new LogicException();
  }

  if (!interaction.inGuild()) {
    throw new ForbiddenException();
  }

  const member = await interaction.guild!.members.fetch(interaction.user.id);

  const isStaff = member.roles.cache.some(role => role.id === rolesId.executor) || member.permissions.has("Administrator");

  if (!isStaff) {
    throw new ForbiddenException();
  }

  await next();
}