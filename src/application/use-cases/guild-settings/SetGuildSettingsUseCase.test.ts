import { GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { GuildSettingsKeys } from "#entities";
import { GuildSettingsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { SetGuildSettingsUseCase } from "./SetGuildSettingsUseCase.js";

describe('SetGuildSettingsUseCase - Testes Unitários', () => {
  let repository: GuildSettingsRepositoryInterface

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
    repository = new GuildSettingsTypeormRepository()
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

  it('Deve criar uma configuração de guild quando não existir', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId = '123456789'

    const settings = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel123'
    })

    assert.ok(settings.id)
    assert.strictEqual(settings.guild, guildId)
    assert.strictEqual(settings.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel123')
    assert.ok(settings.createdAt)
    assert.ok(settings.updatedAt)
  })

  it('Deve atualizar uma configuração de guild existente', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId = '123456789'

    // Criar configuração inicial
    await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel123'
    })

    // Atualizar configuração
    const updatedSettings = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel456'
    })

    assert.ok(updatedSettings.id)
    assert.strictEqual(updatedSettings.guild, guildId)
    assert.strictEqual(updatedSettings.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel456')
  })

  it('Deve criar uma configuração sem valores definidos', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId = '987654321'

    const settings = await useCase.execute(guildId, {})

    assert.ok(settings.id)
    assert.strictEqual(settings.guild, guildId)
    assert.ok(settings.settings)
  })

  it('Deve atualizar parcialmente uma configuração existente', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId = '123456789'

    // Criar configuração inicial
    const initialSettings = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel123'
    })

    assert.strictEqual(initialSettings.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel123')

    // Atualizar apenas um campo
    const updatedSettings = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'new_channel'
    })

    assert.strictEqual(updatedSettings.id, initialSettings.id)
    assert.strictEqual(updatedSettings.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'new_channel')
  })

  it('Deve manter o mesmo ID ao atualizar', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId = '123456789'

    const firstCall = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel1'
    })

    const secondCall = await useCase.execute(guildId, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel2'
    })

    assert.strictEqual(firstCall.id, secondCall.id)
    assert.strictEqual(firstCall.guild, secondCall.guild)
  })

  it('Deve criar configurações separadas para guilds diferentes', async () => {
    const useCase = new SetGuildSettingsUseCase(repository)
    const guildId1 = '111111111'
    const guildId2 = '222222222'

    const settings1 = await useCase.execute(guildId1, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel1'
    })

    const settings2 = await useCase.execute(guildId2, {
      [GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED]: 'channel2'
    })

    assert.notStrictEqual(settings1.id, settings2.id)
    assert.strictEqual(settings1.guild, guildId1)
    assert.strictEqual(settings2.guild, guildId2)
    assert.strictEqual(settings1.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel1')
    assert.strictEqual(settings2.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel2')
  })
})
