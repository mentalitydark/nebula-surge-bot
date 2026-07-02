import { CreateGuildSettingsProps, GuildSettingsRepositoryInterface, SearchGuildSettingsInput, SearchOutput } from "#application/repositories/index.js";
import { GuildSettings } from "#entities";
import { NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import { Repository } from "typeorm";

export class GuildSettingsTypeormRepository implements GuildSettingsRepositoryInterface {
  private repository: Repository<GuildSettings>

  public constructor() {
    this.repository = dataSource.getRepository(GuildSettings)
  }

  public create(data: CreateGuildSettingsProps): GuildSettings {
    return this.repository.create(data)
  }

  public async insert(model: GuildSettings): Promise<GuildSettings> {
    return this.repository.save(model)
  }

  public async findByGuild(guild: string): Promise<GuildSettings> {
    const settings = await this.repository.findOneBy({ guild })

    if (!settings) {
      throw new NotFoundError("Configurações do servidor não encontradas")
    }

    return settings
  }

  public async search(props: SearchGuildSettingsInput): Promise<SearchOutput<GuildSettings>> {
    const page = props.page ?? 1
    const per_page = props.per_page ?? 10

    const [data, total] = await this.repository.findAndCount({
      where: { guild: props.guild },
      skip: (page - 1) * per_page,
      take: per_page,
    })

    return {
      data,
      total,
      current_page: page,
      per_page: per_page
    }
  }

  public async findById(id: number): Promise<GuildSettings> {
    return this._get(id)
  }

  public async update(model: GuildSettings): Promise<GuildSettings> {
    const settings = await this._get(model.id)

    this.repository.merge(settings, model)

    return this.repository.save(settings)
  }

  public async delete(id: number): Promise<void> {
    const settings = await this._get(id)

    await this.repository.remove(settings)
  }

  private async _get(id: number): Promise<GuildSettings> {
    const settings = await this.repository.findOneBy({ id })

    if (!settings) {
      throw new NotFoundError(`Configurações do servidor com id \`${id}\` não encontradas`)
    }

    return settings
  }
}