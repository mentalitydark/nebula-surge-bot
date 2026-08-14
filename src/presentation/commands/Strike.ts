import { Discord, Guard, Slash, SlashOption } from "discordx";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, CommandInteraction, GuildMember, roleMention, userMention } from "discord.js";
import { SendAuditLogUseCase, ApplyStrikeUseCase, StrikeAction } from "@/application/use-cases";
import { channelsId, rolesId } from "@/infrastructure/config";
import { DiscordLogProvider } from "@/infrastructure/providers";
import { colors } from "@/presentation/constants";
import { Exception, NotFoundException } from "@/domain/errors";
import { LoggerMiddleware, StaffOnlyMiddleware } from "@/presentation/middlewares";

@Discord()
export class Strike {
  @Slash({ name: "strike", description: "Adiciona/Remove um strike a um usuário" })
  @Guard(LoggerMiddleware, StaffOnlyMiddleware)
  public async strike(
    @SlashOption({ name: "member", description: "Membro a ser adicionado o strike", type: ApplicationCommandOptionType.User, required: true })
    memberTarget: GuildMember,

    @SlashOption({ name: "reason", description: "Motivo do strike", type: ApplicationCommandOptionType.String, required: true })
    reason: string,

    @SlashOption({ name: "increment", description: "Se deve incrementar o strike ou não (padrão: true)", type: ApplicationCommandOptionType.Boolean, required: false })
    increment: boolean = true,

    interaction: CommandInteraction
  ): Promise<void> {
    const { guild } = interaction;

    if (!guild) {
      return;
    }

    const action = await this.getAction(memberTarget, increment);

    try {
      switch (action) {
        case StrikeAction.ADD_STRIKE:
          await this.addStrike(interaction, memberTarget, reason);
          break;
        case StrikeAction.REMOVE_STRIKE:
          await this.removeStrike(interaction, memberTarget, reason);
          break;
        case StrikeAction.BAN:
          await this.ban(interaction, memberTarget, reason);
          break;
        case StrikeAction.NOTHING:
          await interaction.reply({ flags: ['Ephemeral'], embeds: [createEmbed({ description: 'Nenhuma ação realizada', color: colors.warning })] });
          break;
        default:
          await interaction.reply({ flags: ['Ephemeral'], embeds: [createEmbed({ description: 'Ação inválida', color: colors.danger })] });
          break;
      }
    } catch (error) {
      if (error instanceof Exception) {
        await interaction.reply({ flags: ['Ephemeral'], embeds: [createEmbed({ description: error.message, color: colors.danger })] });
      } else {
        throw error;
      }
    }
  }

  private async sendLog(interaction: CommandInteraction, member: GuildMember, reason: string, action: StrikeAction): Promise<void> {
    let title: string = 'Strike adicionado';
    if (action === StrikeAction.REMOVE_STRIKE) title = 'Strike removido';
    else if (action === StrikeAction.BAN) title = 'Usuário banido';

    let color: string = colors.danger;
    if (action === StrikeAction.REMOVE_STRIKE) color = colors.success;
    else if (action === StrikeAction.BAN) color = colors.danger;

    const sendAuditLogUseCase = new SendAuditLogUseCase(new DiscordLogProvider(interaction.guild!, channelsId.logs));
    await sendAuditLogUseCase.execute({
      title, color,
      fields: [{ name: 'Membro', value: userMention(member.id), inline: true },
      { name: 'Dado por', value: userMention(interaction.user.id), inline: true },
      { name: 'Motivo', value: reason }]
    });
  }

  private async ban(interaction: CommandInteraction, member: GuildMember, reason: string): Promise<void> {
    await member.ban({ reason });

    await interaction.reply({
      flags: ['Ephemeral'],
      embeds: [createEmbed({ description: 'Usuário banido', color: colors.danger })]
    });

    await this.sendLog(interaction, member, reason, StrikeAction.BAN);
  }

  private async removeStrike(interaction: CommandInteraction, member: GuildMember, reason: string): Promise<void> {
    const strikeLevel = await this.getMemberCurrentStrikeLevel(member);

    if (strikeLevel < 0) {
      await interaction.reply({
        flags: ['Ephemeral'],
        embeds: [createEmbed({ description: 'O usuário não possui strikes', color: colors.danger })]
      });
      return;
    }

    const { strikesLevels } = rolesId;
    const strikeLevelData = strikesLevels.find(level => level.level === strikeLevel);

    if (!strikeLevelData) {
      throw new NotFoundException('Nível de strike inválido');
    }

    const role = member.roles.cache.get(strikeLevelData.roleId);

    if (!role) {
      return;
    }
    const previousStrikeLevelData = strikesLevels.find(level => level.level === strikeLevel - 1);

    if (previousStrikeLevelData) {
      await Promise.allSettled([
        member.roles.remove(role, reason),
        member.roles.add(previousStrikeLevelData.roleId, reason)
      ]);
    } else {
      await member.roles.remove(role, reason);
    }

    await interaction.reply({
      flags: ['Ephemeral'],
      embeds: [createEmbed({ description: `${roleMention(role.id)} removido`, color: colors.success })]
    });

    await this.sendLog(interaction, member, reason, StrikeAction.REMOVE_STRIKE);
  }

  private async addStrike(interaction: CommandInteraction, member: GuildMember, reason: string): Promise<void> {
    const currentStrikeLevel = await this.getMemberCurrentStrikeLevel(member);
    const nextStrikeLevel = currentStrikeLevel + 1;

    const { strikesLevels } = rolesId;
    const strikeLevel = strikesLevels.find(level => level.level === nextStrikeLevel);

    if (!strikeLevel) {
      throw new NotFoundException('Nível de strike inválido');
    }

    await this.removeAllStrikes(member, reason);
    await member.roles.add(strikeLevel.roleId, reason);

    await interaction.reply({
      flags: ['Ephemeral'],
      embeds: [createEmbed({ description: `${roleMention(strikeLevel.roleId)} adicionado`, color: colors.danger })]
    });

    await this.sendLog(interaction, member, reason, StrikeAction.ADD_STRIKE);
  }

  private async getAction(member: GuildMember, increment: boolean) {
    const strikeMaxLevel = await this.getMaxStrikeLevel();
    const strikeCurrentLevel = await this.getMemberCurrentStrikeLevel(member);

    const applyStrikeUseCase = new ApplyStrikeUseCase();
    return applyStrikeUseCase.execute({ strikeCurrentLevel, strikeMaxLevel, increment });
  }

  private async getMaxStrikeLevel() {
    const { strikesLevels } = rolesId;

    return strikesLevels.length;
  }

  private async removeAllStrikes(member: GuildMember, reason: string) {
    const { strikesLevels } = rolesId;
    const roles = member.roles.cache.filter(role => strikesLevels.some(strikeLevel => strikeLevel.roleId === role.id));

    await Promise.allSettled(roles.map(role => member.roles.remove(role, reason)));
  }

  private async getMemberCurrentStrikeLevel(member: GuildMember): Promise<number> {
    const { strikesLevels } = rolesId;

    const inverseStrikesLevels = [...strikesLevels].reverse();

    let greatestStrikeLevel: number | undefined;
    for (const strikeLevel of inverseStrikesLevels) {
      const role = member.roles.cache.get(strikeLevel.roleId);
      if (role) {
        greatestStrikeLevel = strikeLevel.level;
        break;
      }
    }

    return greatestStrikeLevel ?? 0;
  }

}