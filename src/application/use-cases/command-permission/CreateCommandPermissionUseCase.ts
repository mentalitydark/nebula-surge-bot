import { CommandPermissionRepositoryInterface, CreateCommandPermissionProps } from "#application/repositories/CommandPermissionRepositoryInterface.js";

export class CreateCommandPermissionUseCase {
  public constructor(
    private readonly repository: CommandPermissionRepositoryInterface,
  ) {}

  public async execute(data: CreateCommandPermissionProps) {
    const model = this.repository.create(data)

    await this.repository.conflictingPermission(model.command, model.role, model.guild)

    const permission = await this.repository.insert(model)

    return permission
  }
}