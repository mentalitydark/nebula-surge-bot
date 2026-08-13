import { UseCaseInterface } from "../contracts";
import { AuditLogDTO, DiscordLogProviderInterface } from "../providers";

export class SendAuditLogUseCase implements UseCaseInterface<AuditLogDTO, Promise<void>> {

  public constructor(
    private readonly auditLogProvider: DiscordLogProviderInterface
  ) { }

  public async execute(input: AuditLogDTO): Promise<void> {
    await this.auditLogProvider.sendLog(input);
  }

}