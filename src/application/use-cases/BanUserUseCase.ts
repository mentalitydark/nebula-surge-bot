import { inject, injectable } from 'tsyringe'

import type { UseCaseInterface, BanUserInterface, BanAuditLogInterface } from '@/application/contracts'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { Exception, ForbiddenException } from '@/domain/errors'
import { BanPeriod, UserId } from '@/domain/value-objects'
import { Image } from '@/domain/value-objects/attachment'
import { BanAuditLogDto } from '@/application/dtos'

export interface BanUserInput {
  guildId: string
  executorId: string
  targetUserId: string
  reason: string
  deleteMessagePeriod: BanPeriod
  attachment?: Image
}

@injectable()
export class BanUserUseCase implements UseCaseInterface<BanUserInput, void> {

  public constructor(
    @inject(APPLICATION_TOKENS.BanUserInterface)
    private readonly banUserProvider: BanUserInterface,
    @inject(APPLICATION_TOKENS.BanAuditLogInterface)
    private readonly banAuditLogProvider: BanAuditLogInterface
  ) { }

  public async execute(data: BanUserInput): Promise<void> {
    const memberInfo = await this.banUserProvider.getMemberInfo(data.guildId, data.targetUserId)

    if (!memberInfo) throw new Exception('Membro não encontrado')
    if (memberInfo.id === data.executorId) throw new ForbiddenException('Não é possível banir a si mesmo')
    if (memberInfo.isStaff) throw new ForbiddenException('Não é possível banir um membro da equipe')
    if (memberInfo.isBot) throw new ForbiddenException('Não é possível banir um bot')

    await this.banUserProvider.ban({
      guildId: data.guildId,
      userId: data.targetUserId,
      reason: data.reason,
      deleteMessageSeconds: data.deleteMessagePeriod.value,
    })

    await this.banAuditLogProvider.log(BanAuditLogDto.create({
      guildId: data.guildId,
      executorId: UserId.create(data.executorId),
      targetUserId: UserId.create(data.targetUserId),
      reason: data.reason,
      deleteMessageBanPeriodLabel: data.deleteMessagePeriod.label,
      attachment: data.attachment
    }))
  }

}
