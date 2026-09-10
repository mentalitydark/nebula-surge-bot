import { inject, injectable } from 'tsyringe'

import type { UseCaseInterface } from '@/application/contracts'
import type { SendEmbedMessageDTO, SendEmbedMessageProviderInterface } from '@/application/contracts/SendEmbedMessageInterface'

import { APPLICATION_TOKENS } from '@/application/container/tokens'

@injectable()
export class SendEmbedMessageUseCase implements UseCaseInterface<SendEmbedMessageDTO, Promise<void>> {
  public constructor(
    @inject(APPLICATION_TOKENS.SendEmbedMessageProviderInterface)
    private readonly provider: SendEmbedMessageProviderInterface
  ) { }

  public async execute(data: SendEmbedMessageDTO): Promise<void> {
    await this.provider.send(data)
  }
}
