import { CommandPermissionRepositoryInterface, CreateCommandPermissionProps, SearchCommandPermissionInput, SearchOutput } from "#application/repositories/index.js";
import { CommandPermission, CommandPermissionModel } from "#entities";
import { ConflictError, NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import { roleMention } from "discord.js";
import { ILike, Not, Repository } from "typeorm";

export class CommandPermissionTypeormRepository implements CommandPermissionRepositoryInterface {
  private repository: Repository<CommandPermission>

  public constructor() {
    this.repository = dataSource.getRepository(CommandPermission)
  }

  public async findByCommand(command: string, guild: string): Promise<CommandPermissionModel[]> {
    const res = await this.repository.findBy({ command, guild })

    if (res.length === 0) {
      throw new NotFoundError(`Permissões para o comando \`${command}\` na guild \`${guild}\` não encontradas`)
    }

    return res
  }

  public async findByRole(role: string, guild: string): Promise<CommandPermissionModel[]> {
    const res = await this.repository.findBy({ role, guild })

    if (res.length === 0) {
      throw new NotFoundError(`Permissões para o cargo ${roleMention(role)} na guild \`${guild}\` não encontradas`)
    }

    return res
  }

  public async findByGuild(guild: string): Promise<CommandPermissionModel[]> {
    const res = await this.repository.findBy({ guild })

    if (res.length === 0) {
      throw new NotFoundError(`Permissões para a guild \`${guild}\` não encontradas`)
    }

    return res
  }

  public async conflictingPermission(command: string, role: string, guild: string, id?: number): Promise<void> {
    const res = await this.repository.findOneBy({
      command,
      role,
      guild,
      id: id ? Not(id) : undefined
    })

    if (res) {
      throw new ConflictError(`Já foi cadastrada a permissão para o cargo ${roleMention(role)} para executar o comando \`${command}\``)
    }
  }

  public create(data: CreateCommandPermissionProps): CommandPermissionModel {
    return this.repository.create(data)
  }

  public async insert(model: CommandPermissionModel): Promise<CommandPermissionModel> {
    return this.repository.save(model)
  }

  public async search(props: SearchCommandPermissionInput): Promise<SearchOutput<CommandPermissionModel>> {
    const page = props.page ?? 1
    const per_page = props.per_page ?? 10
    const filter = props.filter ?? null
    const guild = props.guild

    const where: any = { guild }

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            where[key] = ILike(`%${value}%`)
          } else {
            where[key] = value
          }
        }
      })
    }

    const [permissions, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * per_page,
      take: per_page,
      where,
    })

    return {
      data: permissions,
      current_page: page,
      per_page,
      total
    }
  }

  public findById(id: number): Promise<CommandPermissionModel> {
    return this._get(id)
  }

  public async update(model: CommandPermissionModel): Promise<CommandPermissionModel> {
    const permission = await this._get(model.id)
    this.repository.merge(permission, model)
    return this.repository.save(permission)
  }

  public async delete(id: number): Promise<void> {
    const permission = await this._get(id)
    await this.repository.remove(permission)
  }

  private async _get(id: number): Promise<CommandPermissionModel> {
    const permission = await this.repository.findOneBy({ id })

    if (!permission) {
      throw new NotFoundError('Permissão não encontrada')
    }

    return permission
  }

}
