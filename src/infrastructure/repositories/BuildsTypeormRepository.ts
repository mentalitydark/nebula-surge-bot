import { Build, BuildModel } from "#entities";
import { ConflictError, NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import { ILike, Not, Repository } from "typeorm";
import { BuildsRepositoryInterface, CreateBuildProps, SearchInput, SearchOutput } from "../../application/repositories/index.js";

export class BuildsTypeormRepository implements BuildsRepositoryInterface {
  private repository: Repository<Build>

  public constructor() {
    this.repository = dataSource.getRepository(Build)
  }

  public async findByEquipment(equipment: string): Promise<BuildModel> {
    const res = await this.repository.findOneBy({ equipment })

    if (!res) {
      throw new NotFoundError(`Equipamento \`${equipment}\` não encontrado`)
    }

    return res
  }

  public async conflictingEquipment(equipment: string, id?: number): Promise<void> {
    const res = await this.repository.findOneBy({ equipment, id: id ? Not(id) : undefined })

    if (res) {
      throw new ConflictError(`Equipamento \`${equipment}\` já cadastrado`)
    }
  }

  public create(data: CreateBuildProps): BuildModel {
    return this.repository.create(data)
  }

  public async insert(model: BuildModel): Promise<BuildModel> {
    return this.repository.save(model)
  }

  public async search(props: SearchInput<BuildModel>): Promise<SearchOutput<BuildModel>> {
    const page = props.page ?? 1
    const per_page = props.per_page ?? 10
    const filter = props.filter ?? null

    const where: any = {}

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

    const [Build, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * per_page,
      take: per_page,
      where: Object.keys(where).length > 0 ? where : undefined,
    })

    return {
      data: Build,
      current_page: page,
      per_page,
      total
    }
  }

  public findById(id: number): Promise<BuildModel> {
    return this._get(id)
  }

  public async update(model: BuildModel): Promise<BuildModel> {
    const build = await this._get(model.id)
    this.repository.merge(build, model)
    return this.repository.save(build)
  }

<<<<<<< HEAD
  public async deleteByEquipment(equipment: string): Promise<void> {
    const build = await this.findByEquipment(equipment)
=======
  public async deleteByEquipament(equipament: string): Promise<void> {
    const build = await this.findByEquipament(equipament)
>>>>>>> origin/master

    await this.repository.remove(build)
  }

  public async delete(id: number): Promise<void> {
    const build = await this._get(id)
    await this.repository.remove(build)
  }

  private async _get(id: number): Promise<BuildModel> {
    const build = await this.repository.findOneBy({ id })

    if (!build) {
      throw new NotFoundError('Build não encontrado')
    }

    return build
  }

}