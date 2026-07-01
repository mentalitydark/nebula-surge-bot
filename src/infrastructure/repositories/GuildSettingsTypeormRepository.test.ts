import { NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { GuildSettingsTypeormRepository } from "./GuildSettingsTypeormRepository.js";

describe('GuildSettingsTypeormRepository - Testes Unitários', () => {
  let repository: GuildSettingsTypeormRepository

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

  describe('findByGuild', () => {
    it('Deve retornar um erro quando o guildId não existir', async () => {
      await assert.rejects(repository.findByGuild('not-exist'), NotFoundError)
    })

    it('Deve retornar as configurações do guildId especificado', async () => {
      const settings = repository.create({ guild: '123456789', settings: { channel_history_id: 'channel123' } })
      await repository.insert(settings)

      const foundSettings = await repository.findByGuild('123456789')

      assert.deepStrictEqual(foundSettings, settings)
      assert.ok(foundSettings.id)
      assert.strictEqual(foundSettings.guild, '123456789')
      assert.strictEqual(foundSettings.settings?.channel_history_id, 'channel123')
    })
  })

  describe('create', () => {
    it('Deve criar uma configuração de guilda', () => {
      const settings = repository.create({ guild: '123456789', settings: null })

      assert.ok(settings)
      assert.strictEqual(settings.guild, '123456789')
      assert.strictEqual(settings.settings, null)
    })
  })

  describe('insert', () => {
    it('Deve inserir uma configuração de guilda no banco de dados', async () => {
      const settings = repository.create({ guild: '123456789', settings: { channel_history_id: 'channel123' } })

      const insertedSettings = await repository.insert(settings)

      assert.ok(insertedSettings.id)
      assert.strictEqual(insertedSettings.guild, '123456789')
      assert.strictEqual(insertedSettings.settings?.channel_history_id, 'channel123')
    })

    it('Deve retornar um erro ao inserir uma configuração de guilda já existente', async () => {
      await repository.insert(repository.create({ guild: '123456789', settings: null }))

      await assert.rejects(repository.insert(repository.create({ guild: '123456789', settings: null })), Error)
    })
  })

  describe('search', () => {
    it('Deve retornar uma lista de configurações de guilda com paginação', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.insert(repository.create({ guild: `guild${i}`, settings: null }))
      }

      const resultPage1 = await repository.search({ page: 1, per_page: 10, guild: 'guild0' })
      assert.strictEqual(resultPage1.data.length, 1)
      assert.strictEqual(resultPage1.total, 1)
      assert.strictEqual(resultPage1.current_page, 1)
      assert.strictEqual(resultPage1.per_page, 10)
    })

    it('Deve retornar uma lista de configurações de guilda com filtro', async () => {
      await repository.insert(repository.create({ guild: 'guild1', settings: null }))
      await repository.insert(repository.create({ guild: 'guild2', settings: null }))
      await repository.insert(repository.create({ guild: 'guild3', settings: null }))

      const result = await repository.search({ guild: 'guild1' })

      assert.strictEqual(result.data.length, 1)
      assert.strictEqual(result.total, 1)
      assert.strictEqual(result.data[0].guild, 'guild1')
    })

    it('Deve retornar uma lista vazia quando não houver configurações de guilda', async () => {
      const result = await repository.search({ guild: '' })

      assert.strictEqual(result.data.length, 0)
      assert.strictEqual(result.total, 0)
    })
  })

  describe('findById', () => {
    it('Deve retornar uma configuração de guilda pelo id', async () => {
      const settings = repository.create({ guild: '123456789', settings: null })
      await repository.insert(settings)

      const foundSettings = await repository.findById(settings.id)

      assert.deepStrictEqual(foundSettings, settings)
      assert.ok(foundSettings.id)
    })

    it('Deve retornar um erro quando o id não existir', async () => {
      await assert.rejects(repository.findById(9999), NotFoundError)
    })
  })

  describe('update', () => {
    it('Deve atualizar uma configuração de guilda no banco de dados', async () => {
      const settings = repository.create({ guild: '123456789', settings: null })
      await repository.insert(settings)

      settings.settings = { channel_history_id: 'new_channel' }

      const updatedSettings = await repository.update(settings)

      assert.strictEqual(updatedSettings.guild, '123456789')
      assert.strictEqual(updatedSettings.settings?.channel_history_id, 'new_channel')
      assert.ok(updatedSettings.id)
    })

    it('Deve retornar um erro ao atualizar uma configuração de guilda não existente', async () => {
      const settings = repository.create({ guild: '123456789', settings: null })
      settings.id = 9999

      await assert.rejects(repository.update(settings), NotFoundError)
    })
  })

  describe('delete', () => {
    it('Deve deletar uma configuração de guilda do banco de dados', async () => {
      const settings = repository.create({ guild: '123456789', settings: null })
      await repository.insert(settings)

      await repository.delete(settings.id)

      await assert.rejects(repository.findById(settings.id), NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma configuração de guilda não existente', async () => {
      await assert.rejects(repository.delete(9999), NotFoundError)
    })
  })

})
