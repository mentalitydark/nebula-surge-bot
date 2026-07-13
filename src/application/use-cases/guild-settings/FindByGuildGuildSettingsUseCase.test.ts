import { GuildSettingsKeys, GuildSettingsModel, Settings } from "#entities";
import { NotFoundError } from "#errors";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { FindByGuildGuildSettingsUseCase } from "./FindByGuildGuildSettingsUseCase.js";

describe('FindByGuildGuildSettingsUseCase - Testes Unitários', () => {
  let repository: GuildSettingsTypeormRepository
  let useCase: FindByGuildGuildSettingsUseCase
  let cache: InMemoryCacheProvider<GuildSettingsModel>

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()

    cache = InMemoryCacheProvider.getInstance('guild-settings:id')

    repository = new GuildSettingsTypeormRepository()
    useCase = new FindByGuildGuildSettingsUseCase(repository, cache)
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('guild_settings').execute()
    cache.clear()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('guild_settings').execute()
      await dataSource.destroy()
    }
  })

  it('Deve encontrar uma guild_settings pelo ID da guild', async () => {
    const settings = repository.create({ guild: '123456789', settings: Settings.fromJSON({ [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel123' }) })
    await repository.insert(settings)

    const foundSettings = await useCase.execute('123456789')

    assert.ok(foundSettings.id)
    assert.strictEqual(foundSettings.guild, '123456789')
    assert.strictEqual(foundSettings.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel123')
  })

  it('Deve retornar um erro quando a guild_settings não existir', async () => {
    await assert.rejects(useCase.execute('not-exist'), NotFoundError)
  })
})