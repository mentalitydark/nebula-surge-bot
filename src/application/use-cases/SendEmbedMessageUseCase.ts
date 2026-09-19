import { inject, injectable } from 'tsyringe'

import type { UseCaseInterface } from '@/application/contracts'
import type { SendEmbedMessageInterface } from '@/application/contracts/SendEmbedMessageInterface'
import type { SendEmbedMessageDto } from '@/application/dtos'

import { APPLICATION_TOKENS } from '@/application/container/tokens'

@injectable()
export class SendEmbedMessageUseCase implements UseCaseInterface<SendEmbedMessageDto, Promise<void>> {
  public constructor(
    @inject(APPLICATION_TOKENS.SendEmbedMessageInterface)
    private readonly provider: SendEmbedMessageInterface
  ) { }

  public async execute(data: SendEmbedMessageDto): Promise<void> {
    await this.provider.send(data)
  }
}
