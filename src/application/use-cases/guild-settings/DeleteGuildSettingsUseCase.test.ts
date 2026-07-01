import { NotFoundError } from "#errors";
import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { DeleteGuildSettingsUseCase } from "./DeleteGuildSettingsUseCase.js";

describe('DeleteGuildSettingsUseCase - Testes Unitários', () => {
  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('guild_settings').execute()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('guild_settings').execute()
      await dataSource.destroy()
    }
  })

  it('Deve deletar uma guild_settings', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new DeleteGuildSettingsUseCase(repository)

    const settings = repository.create({ guild: '123456789', settings: null })
    await repository.insert(settings)

    await useCase.execute(settings.id)

    await assert.rejects(repository.findById(settings.id), NotFoundError)
  })

  it('Deve retornar um erro quando o guild_settings não existir', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new DeleteGuildSettingsUseCase(repository)

    await assert.rejects(useCase.execute(9999), NotFoundError)
  })
})