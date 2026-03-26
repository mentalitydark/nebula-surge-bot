import { ConflictError, NotFoundError } from "#errors";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CommandPermissionTypeormRepository } from "./CommandPermissionsTypeormRepository.js";

describe('CommandPermissionTypeormRepository - Testes Unitários', () => {
  let repository: CommandPermissionTypeormRepository

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
    repository = new CommandPermissionTypeormRepository()
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
      await dataSource.destroy()
    }
  })

  describe('findByCommand', () => {
    it('Deve retornar um erro quando o comando não existir', async () => {
      await assert.rejects(repository.findByCommand('not-exist'), NotFoundError)
    })

    it('Deve retornar uma lista de permissões tendo o mesmo comando', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      const p2 = repository.create({ command: 'cmd1', role: 'role2', guild: 'guild1' })
      const p3 = repository.create({ command: 'cmd2', role: 'role1', guild: 'guild1' })

      await repository.insert(p1)
      await repository.insert(p2)
      await repository.insert(p3)

      const permissions = await repository.findByCommand('cmd1')

      assert.strictEqual(permissions.length, 2)
      assert.ok(permissions.every(p => p.command === 'cmd1'))
    })
  })

  describe('findByRole', () => {
    it('Deve retornar um erro quando o cargo não existir', async () => {
      await assert.rejects(repository.findByRole('not-exist'), NotFoundError)
    })

    it('Deve retornar uma lista de permissões tendo o mesmo cargo', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      const p2 = repository.create({ command: 'cmd2', role: 'role1', guild: 'guild1' })
      const p3 = repository.create({ command: 'cmd1', role: 'role2', guild: 'guild1' })

      await repository.insert(p1)
      await repository.insert(p2)
      await repository.insert(p3)

      const permissions = await repository.findByRole('role1')

      assert.strictEqual(permissions.length, 2)
      assert.ok(permissions.every(p => p.role === 'role1'))
    })
  })

  describe('findByGuild', () => {
    it('Deve retornar um erro quando o guildId não existir', async () => {
      await assert.rejects(repository.findByGuild('not-exist'), NotFoundError)
    })

    it('Deve retornar uma lista de permissões tendo o mesmo guildId', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      const p2 = repository.create({ command: 'cmd2', role: 'role2', guild: 'guild1' })
      const p3 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild2' })

      await repository.insert(p1)
      await repository.insert(p2)
      await repository.insert(p3)

      const permissions = await repository.findByGuild('guild1')

      assert.strictEqual(permissions.length, 2)
      assert.ok(permissions.every(p => p.guild === 'guild1'))
    })
  })

  describe('conflitingPermission', () => {
    it('Deve retornar um erro quando a permissão já existir', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      await repository.insert(p1)

      await assert.rejects(repository.conflitingPermission('cmd1', 'role1', 'guild1'), ConflictError)
    })

    it('Não deve retornar um erro quando o GuildId for diferente', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      await repository.insert(p1)

      await assert.doesNotReject(repository.conflitingPermission('cmd1', 'role1', 'guild2'))
    })

    it('Não deve retornar um erro quando a permissão não existir', async () => {
      await assert.doesNotReject(repository.conflitingPermission('cmd1', 'role1', 'guild1'))
    })
  })

  describe('create', () => {
    it('Deve criar uma permissão', async () => {
      const data = { command: 'cmd1', role: 'role1', guild: 'guild1' }
      const permission = repository.create(data)

      assert.strictEqual(permission.command, data.command)
      assert.strictEqual(permission.role, data.role)
      assert.strictEqual(permission.guild, data.guild)
    })
  })

  describe('insert', () => {
    it('Deve inserir uma permissão no banco de dados', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      const inserted = await repository.insert(p1)

      assert.ok(inserted.id)
      assert.ok(inserted.createdAt)
    })

    it('Deve retornar um erro ao inserir uma permissão já existente', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      await repository.insert(p1)

      const p2 = repository.create({ command: 'cmd1', role: 'role1', guild: 'guild1' })
      await assert.rejects(repository.insert(p2), Error)
    })
  })

  describe('search', () => {
    it('Deve retornar uma lista de permissões', async () => {
      await repository.insert(repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' }))
      await repository.insert(repository.create({ command: 'cmd2', role: 'r2', guild: 'g2' }))

      const result = await repository.search({})

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.total, 2)
    })

    it('Deve retornar uma lista vazia quando não houver permissões', async () => {
      const result = await repository.search({})

      assert.strictEqual(result.data.length, 0)
      assert.strictEqual(result.total, 0)
    })

    it('Deve retornar uma lista de permissões com paginação', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.insert(repository.create({ command: `cmd${i}`, role: 'r', guild: 'g' }))
      }

      const resultPage1 = await repository.search({ page: 1, per_page: 10 })
      assert.strictEqual(resultPage1.data.length, 10)
      assert.strictEqual(resultPage1.total, 15)

      const resultPage2 = await repository.search({ page: 2, per_page: 10 })
      assert.strictEqual(resultPage2.data.length, 5)
    })

    it('Deve retornar uma lista de permissões com filtro', async () => {
      await repository.insert(repository.create({ command: 'ban', role: 'r1', guild: 'g1' }))
      await repository.insert(repository.create({ command: 'kick', role: 'r2', guild: 'g2' }))
      await repository.insert(repository.create({ command: 'bank', role: 'r3', guild: 'g3' }))

      const result = await repository.search({ filter: 'ban' })

      assert.strictEqual(result.data.length, 2) // ban and bank
      assert.strictEqual(result.total, 2)
    })
  })

  describe('findById', () => {
    it('Deve retornar uma permissão quando o id existir', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' })
      await repository.insert(p1)

      const found = await repository.findById(p1.id)

      assert.deepStrictEqual(found, p1)
    })

    it('Deve retornar um erro quando o id não existir', async () => {
      await assert.rejects(repository.findById(9999), NotFoundError)
    })
  })

  describe('update', () => {
    it('Deve atualizar uma permissão no banco de dados', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' })
      await repository.insert(p1)

      p1.command = 'new-cmd'
      const updated = await repository.update(p1)

      assert.strictEqual(updated.command, 'new-cmd')
    })

    it('Deve retornar um erro ao atualizar uma permissão não existente', async () => {
      const p = repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' })
      p.id = 9999
      await assert.rejects(repository.update(p), NotFoundError)
    })

    it('Deve retornar um erro ao atualizar uma permissão com dados conflitantes', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' })
      const p2 = repository.create({ command: 'cmd2', role: 'r2', guild: 'g2' })
      await repository.insert(p1)
      await repository.insert(p2)

      p2.command = 'cmd1'
      p2.role = 'r1'
      p2.guild = 'g1'

      await assert.rejects(repository.update(p2), Error)
    })
  })

  describe('delete', () => {
    it('Deve deletar uma permissão do banco de dados', async () => {
      const p1 = repository.create({ command: 'cmd1', role: 'r1', guild: 'g1' })
      await repository.insert(p1)

      await repository.delete(p1.id)

      await assert.rejects(repository.findById(p1.id), NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma permissão não existente', async () => {
      await assert.rejects(repository.delete(9999), NotFoundError)
    })
  })

})
