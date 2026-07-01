import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateGuildSettingsUseCase } from "./CreateGuildSettingsUseCase.js";

describe('CreateGuildSettingsUseCase - Testes Unitários', () => {
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

  it('Deve criar uma guild_settings', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new CreateGuildSettingsUseCase(repository)
    const settings = await useCase.execute({ guild: '123456789', settings: { channel_history_id: 'channel123' } })

    assert.ok(settings.id)
    assert.strictEqual(settings.guild, '123456789')
    assert.strictEqual(settings.settings?.channel_history_id, 'channel123')
  })

  it('Deve retornar um erro quando o guild_settings já existir', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new CreateGuildSettingsUseCase(repository)
    const settings = await useCase.execute({ guild: '123456789', settings: null })

    assert.ok(settings.id)

    await assert.rejects(useCase.execute({ guild: '123456789', settings: null }), Error)
  })
})