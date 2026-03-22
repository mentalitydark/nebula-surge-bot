import { BuildsRepositoryInterface, CreateBuildProps, SearchInput, SearchOutput } from "#domain/repositories/index.js";
import { Builds, BuildsModel } from "#entities";
import { ConflictError, NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import { ILike, Not, Repository } from "typeorm";

export class BuildsTypeormRepository implements BuildsRepositoryInterface {
  private repository: Repository<Builds>

  public constructor() {
    this.repository = dataSource.getRepository(Builds)
  }

  public async findByEquipament(equipament: string): Promise<BuildsModel> {
    const res = await this.repository.findOneBy({ equipament })

    if (!res) {
      throw new NotFoundError(`Equipamento \`${equipament}\` não encontrado`)
    }

    return res
  }

  public async conflitingEquipament(equipament: string, id?: number): Promise<void> {
    const res = await this.repository.findOneBy({ equipament, id: id ? Not(id) : undefined })
    
    if (res) {
      throw new ConflictError(`Equipamento \`${equipament}\` já cadastrado`)
    }
  }

  public create(data: CreateBuildProps): BuildsModel {
    return this.repository.create(data)
  }

  public async insert(model: BuildsModel): Promise<BuildsModel> {
    return this.repository.save(model)
  }

  public async search(props: SearchInput<BuildsModel>): Promise<SearchOutput<BuildsModel>> {
    const page = props.page ?? 1
    const per_page = props.per_page ?? 10
    const filter = props.filter ?? null

    const [builds, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * per_page,
      take: per_page,
      where: filter ? { equipament: ILike(`%${filter}%`) } : undefined,
    })

    return {
      data: builds,
      current_page: page,
      per_page,
      total
    }
  }

  public findById(id: number): Promise<BuildsModel> {
    return this._get(id)
  }

  public async update(model: BuildsModel): Promise<BuildsModel> {
    const build = await this._get(model.id)
    this.repository.merge(build, model)
    return this.repository.save(build)
  }

  public async deleteByEquipament(equipament: string): Promise<void> {
    const build = await this.findByEquipament(equipament)

    await this.repository.remove(build)
  }

  public async delete(id: number): Promise<void> {
    const build = await this._get(id)
    await this.repository.remove(build)
  }

  private async _get(id: number): Promise<BuildsModel> {
    const build = await this.repository.findOneBy({ id })

    if (!build) {
      throw new NotFoundError('Build não encontrado')
    }

    return build
  }

}