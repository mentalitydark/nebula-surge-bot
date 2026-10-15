import { userMention } from 'discord.js'
import { inject, injectable } from 'tsyringe'

import type { BanAuditLogDto, BanAuditLogInterface, DiscordLogInterface } from '@/application/contracts'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { channelsId } from '@/infrastructure/config'
import { colors } from '@/presentation/constants'

@injectable()
export class BanAuditLogProvider implements BanAuditLogInterface {

  public constructor(
    @inject(APPLICATION_TOKENS.DiscordLogInterface)
    private readonly discordLogProvider: DiscordLogInterface
  ) { }

  public async log(dto: BanAuditLogDto): Promise<void> {
    await this.discordLogProvider.sendLog({
      guildId: dto.guildId,
      channelId: channelsId.logs,
      title: 'Usuário Banido',
      fields: [
        { name: 'Usuário', value: userMention(dto.targetUserId.getValue()), inline: true },
        { name: 'Por Quem', value: userMention(dto.executorId.getValue()), inline: true },
        { name: 'Período de Exclusão de Mensagens', value: dto.deleteMessageBanPeriodLabel, inline: true },
        { name: 'Anexo', value: dto.attachment ? 'Sim' : 'Nenhum', inline: true },
        { name: 'Motivo', value: dto.reason, inline: true },
      ],
      color: colors.default,
      attachments: dto.attachment ? [dto.attachment] : []
    })
  }
}
