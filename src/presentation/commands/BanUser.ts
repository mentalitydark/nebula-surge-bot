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
  UserSelectMenuBuilder,
  type CommandInteraction,
  type ModalSubmitInteraction,
} from 'discord.js'
import { Discord, Guard, ModalComponent, Slash } from 'discordx'
import { injectable, inject } from 'tsyringe'
import { z } from 'zod'

import type { BanUserUseCase } from '@/application/use-cases'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { Exception, ForbiddenException } from '@/domain/errors'
import { BanPeriod } from '@/domain/value-objects'
import { Image } from '@/domain/value-objects/attachment'
import { isStaff } from '@/infrastructure/helpers'
import { colors } from '@/presentation/constants'
import { OnErrorModalSubmitMiddleware, StaffOnlyMiddleware } from '@/presentation/middlewares'

@Discord()
@injectable()
export class BanUser {

  private readonly modalSchema = z.object({
    reason: z.string().trim().min(1, 'Motivo do banimento não fornecido').max(256, 'Motivo do banimento muito longo'),
    deleteMessageSeconds: z.coerce.number(),
    targetMember: z.custom<GuildMember>((val) => val instanceof GuildMember, 'Usuário não selecionado ou inválido'),
    attachment: z.custom<Attachment>((val) => val instanceof Attachment, 'Anexo inválido')
      .optional()
      .transform((val) => val ? new Image(val.url, val.contentType ?? '', val.size, val.name) : undefined)
  })

  public constructor(
    @inject(APPLICATION_TOKENS.BanUserUseCase)
    private readonly banUserUseCase: BanUserUseCase
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
          new StringSelectMenuOptionBuilder().setLabel(BanPeriod.NONE.label).setValue(String(BanPeriod.NONE.value)).setDefault(true),
          new StringSelectMenuOptionBuilder().setLabel(BanPeriod.MINUTES.label).setValue(String(BanPeriod.MINUTES.value)),
          new StringSelectMenuOptionBuilder().setLabel(BanPeriod.HOURS.label).setValue(String(BanPeriod.HOURS.value)),
          new StringSelectMenuOptionBuilder().setLabel(BanPeriod.DAYS.label).setValue(String(BanPeriod.DAYS.value))
        )
        .setRequired(true)
    )

    const attachment = new LabelBuilder().setLabel('Image de prova (opcional)').setFileUploadComponent(
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
    const guild = interaction.guild
    const memberInvoker = interaction.member

    if (!guild) throw new Exception('Guild não encontrada')
    if (!memberInvoker || !(memberInvoker instanceof GuildMember)) throw new Exception('Membro que executou o comando não encontrado')
    if (!isStaff(memberInvoker)) throw new ForbiddenException()

    await interaction.deferReply({ flags: ['Ephemeral'] })

    const userInput = interaction.fields.getSelectedMembers('user')
    const reasonInput = interaction.fields.getTextInputValue('reason')
    const deleteMessageSecondsInput = interaction.fields.getStringSelectValues('deleteMessageSeconds')
    const attachmentInput = interaction.fields.getUploadedFiles('attachment', false)

    const validationResult = this.modalSchema.safeParse({
      targetMember: userInput?.first(),
      reason: reasonInput,
      deleteMessageSeconds: deleteMessageSecondsInput[0],
      attachment: attachmentInput?.first()
    })

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map(e => e.message).join('\n')
      throw new Exception(errorMessage)
    }

    const { targetMember, reason, deleteMessageSeconds, attachment } = validationResult.data

    await this.banUserUseCase.execute({
      guildId: guild.id,
      executorId: memberInvoker.id,
      targetUserId: targetMember.id,
      reason,
      deleteMessagePeriod: BanPeriod.fromSeconds(Number(deleteMessageSeconds)),
      attachment
    })

    await interaction.editReply({
      embeds: [createEmbed({
        title: 'Usuário banido',
        description: 'O usuário foi banido com sucesso.',
        color: colors.success
      })]
    })
  }

}
