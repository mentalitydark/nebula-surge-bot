import { NotFoundError } from "#errors";
import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { UpdateGuildSettingsUseCase } from "./UpdateGuildSettingsUseCase.js";

describe('UpdateGuildSettingsUseCase - Testes Unitários', () => {
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

  it('Deve atualizar uma guild_settings', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new UpdateGuildSettingsUseCase(repository)
    
    const settings = repository.create({ guild: '123456789', settings: null })
    await repository.insert(settings)

    const updatedSettings = await useCase.execute(settings.id, { 
      guild: '123456789', 
      settings: { channel_history_id: 'new_channel' } 
    })

    assert.ok(updatedSettings.id)
    assert.strictEqual(updatedSettings.guild, '123456789')
    assert.strictEqual(updatedSettings.settings?.channel_history_id, 'new_channel')
  })

  it('Deve retornar um erro quando a guild_settings não existir', async () => {
    const repository = new GuildSettingsTypeormRepository()
    const useCase = new UpdateGuildSettingsUseCase(repository)

    await assert.rejects(useCase.execute(9999, { guild: '123456789', settings: null }), NotFoundError)
  })
})