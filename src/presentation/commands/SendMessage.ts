import { createEmbed } from '@magicyan/discord'
import {
  type CommandInteraction, type ModalSubmitInteraction, type Attachment, type ReadonlyCollection, type Role, type TextChannel,
  ChannelSelectMenuBuilder, ChannelType, FileUploadBuilder, LabelBuilder, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder, TextInputStyle,
} from 'discord.js'
import { Discord, Guard, ModalComponent, Slash } from 'discordx'
import { inject, injectable } from 'tsyringe'

import type { SendEmbedMessageUseCase } from '@/application/use-cases'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { SendEmbedMessageDto } from '@/application/dtos'
import { Exception, InvalidArgumentException } from '@/domain/errors'
import { HexColor } from '@/domain/value-objects'
import { Image } from '@/domain/value-objects/attachment'
import { colors } from '@/presentation/constants'
import { StaffOnlyMiddleware, OnErrorModalSubmitMiddleware } from '@/presentation/middlewares'

@Discord()
@injectable()
export class SendMessage {

  public constructor(
    @inject(APPLICATION_TOKENS.SendEmbedMessageUseCase)
    private readonly sendEmbedMessageProvider: SendEmbedMessageUseCase,
  ) { }

  @Slash({ name: 'send-message', description: 'Envia uma mensagem embed em determinado canal' })
  @Guard(StaffOnlyMiddleware)
  public async execute(interaction: CommandInteraction) {
    const modal = new ModalBuilder().setTitle('Enviar Mensagem').setCustomId('SendMessageModal')

    const roleNotificationInput = new LabelBuilder().setLabel('Cargo').setRoleSelectMenuComponent(
      new RoleSelectMenuBuilder()
        .setCustomId('roleNotification')
        .setPlaceholder('Selecione o cargo que deseja notificar')
        .setMinValues(1)
        .setRequired()
    )

    const channelInput = new LabelBuilder().setLabel('Canal').setChannelSelectMenuComponent(
      new ChannelSelectMenuBuilder()
        .setCustomId('channel')
        .setPlaceholder('Selecione o canal onde deseja enviar a mensagem')
        .setMinValues(1)
        .setMaxValues(1)
        .setRequired()
        .setChannelTypes([ChannelType.GuildText])
    )

    const embedColor = new LabelBuilder().setLabel('Cor do Embed').setTextInputComponent(
      new TextInputBuilder()
        .setCustomId('embedColor')
        .setStyle(TextInputStyle.Short)
        .setRequired()
        .setPlaceholder('Digite a cor do embed em hexadecimal (ex: #FFFFFF)')
        .setValue(colors.default)
    )

    const descriptionInput = new LabelBuilder().setLabel('Descrição do Embed').setTextInputComponent(
      new TextInputBuilder()
        .setCustomId('description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired()
        .setPlaceholder('Digite a descrição do embed')
    )

    const attachmentInput = new LabelBuilder().setLabel('Anexo do Embed').setFileUploadComponent(
      new FileUploadBuilder()
        .setCustomId('attachment')
        .setMaxValues(1)
    )

    modal.addLabelComponents(roleNotificationInput, channelInput, embedColor, descriptionInput, attachmentInput)

    interaction.showModal(modal)
  }

  @ModalComponent({ id: 'SendMessageModal' })
  @Guard(OnErrorModalSubmitMiddleware)
  public async handleModalSubmit(interaction: ModalSubmitInteraction) {
    const rolesNotification = interaction.fields.getSelectedRoles('roleNotification', true)
    const channels = interaction.fields.getSelectedChannels('channel', true, [ChannelType.GuildText])
    const embedColor = interaction.fields.getTextInputValue('embedColor')
    const description = interaction.fields.getTextInputValue('description')
    const attachment = interaction.fields.getUploadedFiles('attachment', false)

    const guild = interaction.guild

    if (!guild) {
      throw new Exception('Guild não encontrada')
    }

    await this.sendEmbedMessageProvider.execute(SendEmbedMessageDto.create({
      guildId: guild.id,
      embedColor: this.parseColor(embedColor),
      channelId: this.parseChannel(channels),
      roleNotificationIds: this.parseRoles(rolesNotification),
      attachment: this.parseAttachment(attachment),
      description,
    }))

    await interaction.reply({
      embeds: [createEmbed({
        color: colors.success,
        description: 'Mensagem enviada com sucesso!',
      })]
    })
  }

  private parseAttachment(attachment: ReadonlyCollection<string, Attachment> | null): Image | undefined {
    if (!attachment || attachment.size === 0) {
      return undefined
    }

    const firstAttachment = attachment.first()
    if (!firstAttachment) {
      return undefined
    }

    return new Image(firstAttachment.url, firstAttachment.contentType ?? '', firstAttachment.size)
  }

  private parseRoles(roles: ReadonlyCollection<string, unknown>): string[] {
    if (!roles || roles.size === 0) {
      throw new InvalidArgumentException('Nenhum cargo foi selecionado para notificação')
    }

    return roles.map(role => (role as Role).id)
  }

  private parseChannel(channel: ReadonlyCollection<string, TextChannel>): string {
    const firstChannel = channel.first()
    if (!firstChannel) {
      throw new InvalidArgumentException('Nenhum canal foi selecionado para envio da mensagem')
    }

    return firstChannel.id
  }

  private parseColor(embedColor: string): HexColor {
    return new HexColor(embedColor)
  }

}
