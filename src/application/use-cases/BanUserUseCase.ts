import { inject, injectable } from 'tsyringe'

import type { UseCaseInterface, BanUserInterface } from '@/application/contracts'
import type { BanUserDtoInput } from '@/application/dtos'

import { APPLICATION_TOKENS } from '@/application/container/tokens'

@injectable()
export class BanUserUseCase implements UseCaseInterface<BanUserDtoInput, void> {

  public constructor(
    @inject(APPLICATION_TOKENS.BanUserInterface)
    private readonly banUserProvider: BanUserInterface
  ) { }

  public async execute(data: BanUserDtoInput): Promise<void> {
    await this.banUserProvider.ban(data)
  }

}
