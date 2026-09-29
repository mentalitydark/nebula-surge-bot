import { createEmbed } from '@magicyan/discord'
import {
  Attachment,
  FileUploadBuilder,
  GuildMember,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  userMention,
  UserSelectMenuBuilder,
  type CommandInteraction,
  type ModalSubmitInteraction,
} from 'discord.js'
import { Discord, Guard, ModalComponent, Slash } from 'discordx'
import { injectable, inject } from 'tsyringe'
import { z } from 'zod'

import type { BanUserUseCase, SendAuditLogUseCase } from '@/application/use-cases'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { BanUserDto, DiscordLogDto } from '@/application/dtos'
import { Time } from '@/domain/enums'
import { Exception } from '@/domain/errors'
import { Image } from '@/domain/value-objects/attachment'
import { channelsId } from '@/infrastructure/config'
import { colors } from '@/presentation/constants'
import { isBot, isStaff, secondsToTime } from '@/presentation/helpers'
import { OnErrorModalSubmitMiddleware, StaffOnlyMiddleware } from '@/presentation/middlewares'


@Discord()
@injectable()
export class BanUser {

  private readonly modalSchema = z.object({
    reason: z.string().trim().min(1, 'Motivo do banimento não fornecido'),
    deleteMessageSeconds: z.preprocess((val: string) => parseInt(val), z.enum(Time, { message: 'Tempo de exclusão de mensagens inválido' })),
    user: z.custom<GuildMember>((val) => val instanceof GuildMember, 'Usuário inválido')
      .refine((val) => !isStaff(val), 'Não é possível banir um membro da equipe')
      .refine((val) => !isBot(val), 'Não é possível banir um bot'),
    attachment: z.custom<Attachment>((val) => val instanceof Attachment, 'Anexo inválido')
      .optional()
      .transform((val) => val ? new Image(val.url, val.contentType ?? '', val.size) : undefined)
  })

  public constructor(
    @inject(APPLICATION_TOKENS.BanUserUseCase)
    private readonly banUserUseCase: BanUserUseCase,
    @inject(APPLICATION_TOKENS.SendAuditLogUseCase)
    private readonly sendAuditLogUseCase: SendAuditLogUseCase
  ) { }

  @Slash({ name: 'ban', description: 'Bane um usuário do servidor' })
  @Guard(StaffOnlyMiddleware)
  public async execute(interaction: CommandInteraction) {
    const modal = new ModalBuilder().setTitle('Banir Usuário').setCustomId('BanUserModal')

    const user = new LabelBuilder().setLabel('Usuário').setUserSelectMenuComponent(
      new UserSelectMenuBuilder()
        .setCustomId('user')
        .setPlaceholder('Selecione um usuário')
        .setMaxValues(1)
        .setMinValues(1)
        .setRequired(true)
    )

    const reason = new LabelBuilder().setLabel('Motivo').setTextInputComponent(
      new TextInputBuilder()
        .setCustomId('reason')
        .setStyle(TextInputStyle.Short)
        .setRequired()
        .setPlaceholder('Digite o motivo do banimento')
        .setMaxLength(256)
    )

    const deleteMessageSeconds = new LabelBuilder().setLabel('Excluir mensagens').setStringSelectMenuComponent(
      new StringSelectMenuBuilder()
        .setCustomId('deleteMessageSeconds')
        .setPlaceholder('Selecione o tempo para excluir mensagens')
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('1 hora').setValue(String(Time.HOUR)).setDefault(true),
          new StringSelectMenuOptionBuilder().setLabel('1 dia').setValue(String(Time.DAY)),
          new StringSelectMenuOptionBuilder().setLabel('1 semana').setValue(String(Time.WEEK))
        )
        .setRequired(true)
    )

    const attachment = new LabelBuilder().setLabel('Anexo (image)').setFileUploadComponent(
      new FileUploadBuilder()
        .setCustomId('attachment')
        .setMaxValues(1)
        .setRequired(false)
    )

    modal.addLabelComponents(user, reason, deleteMessageSeconds, attachment)

    await interaction.showModal(modal)
  }

  @ModalComponent({ id: 'BanUserModal' })
  @Guard(OnErrorModalSubmitMiddleware)
  public async modalSubmit(interaction: ModalSubmitInteraction) {
    const userInput = interaction.fields.getSelectedMembers('user')
    const reasonInput = interaction.fields.getTextInputValue('reason')
    const deleteMessageSecondsInput = interaction.fields.getStringSelectValues('deleteMessageSeconds')
    const attachmentInput = interaction.fields.getUploadedFiles('attachment', false)

    const guild = interaction.guild
    const memberInvoker = interaction.member

    if (!guild) throw new Exception('Guild não encontrada')
    if (!memberInvoker || !(memberInvoker instanceof GuildMember)) throw new Exception('Membro que executou o comando não encontrado')

    await interaction.deferReply({ flags: ['Ephemeral'] })

    const validationData = {
      user: userInput?.first(),
      reason: reasonInput,
      deleteMessageSeconds: deleteMessageSecondsInput[0],
      attachment: attachmentInput?.first()
    }

    const result = this.modalSchema.safeParse(validationData)

    if (!result.success) {
      const errorMessage = result.error.issues.map(e => e.message).join('\n')
      throw new Exception(errorMessage)
    }

    const { user, reason, deleteMessageSeconds, attachment } = result.data

    await this.banUserUseCase.execute(BanUserDto.create({
      guildId: guild.id,
      userId: user.id,
      reason,
      deleteMessageSeconds
    }))

    await this.sendAuditLogUseCase.execute(DiscordLogDto.create({
      guildId: guild.id,
      channelId: channelsId.logs,
      title: 'Usuário banido',
      fields: [
        { name: 'Usuário', value: userMention(user.user.id), inline: true },
        { name: 'Excluir mensagens nos últimos', value: secondsToTime(Number(deleteMessageSeconds)), inline: true },
        { name: 'Por quem', value: userMention(memberInvoker.user.id), inline: true },
        { name: 'Anexo', value: attachment ? 'Sim' : 'Não', inline: true },
        { name: 'Motivo', value: reason, inline: false }
      ],
      color: colors.default,
      attachments: attachment ? [attachment] : []
    }))

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Usuário banido',
        description: 'O usuário foi banido com sucesso.',
        color: colors.success
      })]
    })
  }

}
