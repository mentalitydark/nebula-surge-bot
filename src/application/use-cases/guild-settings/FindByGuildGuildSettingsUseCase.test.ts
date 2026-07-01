import { NotFoundError } from "#errors";
import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { FindByGuildGuildSettingsUseCase } from "./FindByGuildGuildSettingsUseCase.js";

describe('FindByGuildGuildSettingsUseCase - Testes Unitários', () => {
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

  it('Deve encontrar uma guild_settings pelo ID da guild', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new FindByGuildGuildSettingsUseCase(repository)
    
    const settings = repository.create({ guild: '123456789', settings: { channel_history_id: 'channel123' } })
    await repository.insert(settings)

    const foundSettings = await useCase.execute('123456789')

    assert.ok(foundSettings.id)
    assert.strictEqual(foundSettings.guild, '123456789')
    assert.strictEqual(foundSettings.settings?.channel_history_id, 'channel123')
  })

  it('Deve retornar um erro quando a guild_settings não existir', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new FindByGuildGuildSettingsUseCase(repository)

    await assert.rejects(useCase.execute('not-exist'), NotFoundError)
  })
})