import { inject, injectable } from "tsyringe";
import { UseCaseInterface } from "@/application/contracts";
import { AuditLogDTO, DiscordLogProviderInterface } from "@/application/providers";
import { TOKENS } from "@/infrastructure/container/tokens";

@injectable()
export class SendAuditLogUseCase implements UseCaseInterface<AuditLogDTO, Promise<void>> {

  public constructor(
    @inject(TOKENS.DiscordLogProviderInterface)
    private readonly auditLogProvider: DiscordLogProviderInterface
  ) { }

  public async execute(input: AuditLogDTO): Promise<void> {
    await this.auditLogProvider.sendLog(input);
  }

}