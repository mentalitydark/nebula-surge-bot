import { CommandPermissionRepositoryInterface, CreateCommandPermissionProps, SearchInput, SearchOutput } from "#domain/repositories/index.js";
import { CommandPermission, CommandPermissionModel } from "#entities";
import { ConflictError, NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import { ILike, Not, Repository } from "typeorm";

export class CommandPermissionTypeormRepository implements CommandPermissionRepositoryInterface {
  private repository: Repository<CommandPermission>

  public constructor() {
    this.repository = dataSource.getRepository(CommandPermission)
  }

  public async findByCommand(command: string): Promise<CommandPermissionModel[]> {
    const res = await this.repository.findBy({ command })

    if (res.length === 0) {
      throw new NotFoundError(`Permissões para o comando \`${command}\` não encontradas`)
    }

    return res
  }

  public async findByRole(role: string): Promise<CommandPermissionModel[]> {
    const res = await this.repository.findBy({ role })

    if (res.length === 0) {
      throw new NotFoundError(`Permissões para o cargo \`${role}\` não encontradas`)
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

  public async conflitingPermission(command: string, role: string, guild: string, id?: number): Promise<void> {
    const res = await this.repository.findOneBy({ 
      command, 
      role, 
      guild, 
      id: id ? Not(id) : undefined
    })
    
    if (res) {
      throw new ConflictError(`Já foi cadastrada a permissão para o cargo <@&${role}> para executar o comando \`${command}\``)
    }
  }

  public create(data: CreateCommandPermissionProps): CommandPermissionModel {
    return this.repository.create(data)
  }

  public async insert(model: CommandPermissionModel): Promise<CommandPermissionModel> {
    return this.repository.save(model)
  }

  public async search(props: SearchInput<CommandPermissionModel>): Promise<SearchOutput<CommandPermissionModel>> {
    const page = props.page ?? 1
    const per_page = props.per_page ?? 10
    const filter = props.filter ?? null

    const [permissions, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * per_page,
      take: per_page,
      where: filter ? { command: ILike(`%${filter}%`) } : undefined,
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
