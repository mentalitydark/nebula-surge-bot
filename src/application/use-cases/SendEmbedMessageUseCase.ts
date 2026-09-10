import { inject, injectable } from 'tsyringe'

import type { UseCaseInterface } from '@/application/contracts'
import type { SendEmbedMessageDTO, SendEmbedMessageInterface } from '@/application/contracts/SendEmbedMessageInterface'

import { APPLICATION_TOKENS } from '@/application/container/tokens'

@injectable()
export class SendEmbedMessageUseCase implements UseCaseInterface<SendEmbedMessageDTO, Promise<void>> {
  public constructor(
    @inject(APPLICATION_TOKENS.SendEmbedMessageInterface)
    private readonly provider: SendEmbedMessageInterface
  ) { }

  public async execute(data: SendEmbedMessageDTO): Promise<void> {
    await this.provider.send(data)
  }
}
