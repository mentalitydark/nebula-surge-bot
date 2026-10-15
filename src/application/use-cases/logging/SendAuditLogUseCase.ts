import { inject, injectable } from 'tsyringe'

import type { DiscordLogDto, DiscordLogInterface, UseCaseInterface } from '@/application/contracts'

import { APPLICATION_TOKENS } from '@/application/container/tokens'

@injectable()
export class SendAuditLogUseCase implements UseCaseInterface<DiscordLogDto, Promise<void>> {

  public constructor(
    @inject(APPLICATION_TOKENS.DiscordLogInterface)
    private readonly auditLogProvider: DiscordLogInterface
  ) { }

  public async execute(input: DiscordLogDto): Promise<void> {
    await this.auditLogProvider.sendLog(input)
  }

}
