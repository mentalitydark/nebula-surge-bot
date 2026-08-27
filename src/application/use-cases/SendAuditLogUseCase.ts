import { inject, injectable } from 'tsyringe'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { type UseCaseInterface } from '@/application/contracts'
import { type AuditLogDTO, type DiscordLogProviderInterface } from '@/application/providers'

@injectable()
export class SendAuditLogUseCase implements UseCaseInterface<AuditLogDTO, Promise<void>> {

  public constructor(
    @inject(APPLICATION_TOKENS.DiscordLogProviderInterface)
    private readonly auditLogProvider: DiscordLogProviderInterface
  ) { }

  public async execute(input: AuditLogDTO): Promise<void> {
    await this.auditLogProvider.sendLog(input)
  }

}
