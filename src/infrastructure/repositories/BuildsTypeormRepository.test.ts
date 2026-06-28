import { ConflictError, NotFoundError } from "#errors"
import { dataSource } from "#typeorm"
import assert from "node:assert"
import { after, before, beforeEach, describe, it } from "node:test"
import { BuildsTypeormRepository } from "./BuildsTypeormRepository.js"

describe('BuildsTypeormRepository - Testes Unitários', () => {
  let repository: BuildsTypeormRepository

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
    repository = new BuildsTypeormRepository()
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('builds').execute()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('builds').execute()
      await dataSource.destroy()
    }
  })

  describe('findByEquipment', () => {
    it('Deve retornar um erro quando o equipamento não existir', async () => {
      await assert.rejects(repository.findByEquipment('not-exist'), NotFoundError)
    })

    it('Deve retornar uma build quando o equipamento existir', async () => {
      const equipment = repository.create({ equipment: 'equipment', content: 'content' })
      await repository.insert(equipment)

      const build = await repository.findByEquipment('equipment')

      assert.deepStrictEqual(build, equipment)
      assert.ok(build.id)
      assert.ok(build.createdAt)
      assert.ok(build.updatedAt)
    })
  })

  describe('insert', () => {
    it('Deve inserir uma build no banco de dados', async () => {
      const equipment = repository.create({ equipment: 'equipment', content: 'content' })

      const build = await repository.insert(equipment)

      assert.ok(build.id)
      assert.ok(build.createdAt)
      assert.ok(build.updatedAt)
    })

    it('Deve retornar um erro ao inserir uma build já existente', async () => {
      await repository.insert(repository.create({ equipment: 'error equipment', content: '' }))

      await assert.rejects(repository.insert(repository.create({ equipment: 'error equipment', content: '' })), Error)
    })
  })

  describe('update', () => {
    it('Deve atualizar uma build no banco de dados', async () => {
      const build = repository.create({ equipment: 'equipment', content: 'content' })
      await repository.insert(build)

      build.equipment = 'new equipment'
      build.content = 'new content'

      const updatedBuild = await repository.update(build)

      assert.strictEqual(updatedBuild.equipment, 'new equipment')
      assert.strictEqual(updatedBuild.content, 'new content')
      assert.ok(updatedBuild.id)
      assert.ok(updatedBuild.createdAt)
      assert.ok(updatedBuild.updatedAt)
    })

    it('Deve retornar um erro ao atualizar uma build não existente', async () => {
      await assert.rejects(repository.update(repository.create({ equipment: 'error equipment', content: '' })), NotFoundError)
    })

    it('Deve retornar um erro ao atualizar uma build já existente', async () => {
      const build01 = repository.create({ equipment: 'equipment 01', content: 'content' })
      const build02 = repository.create({ equipment: 'equipment 02', content: 'content' })
      await repository.insert(build01)
      await repository.insert(build02)

      build02.equipment = 'equipment 01'

      await assert.rejects(repository.update(build02), Error)
    })
  })

  describe('delete', () => {
    it('Deve deletar uma build do banco de dados', async () => {
      const build = repository.create({ equipment: 'equipment', content: 'content' })
      await repository.insert(build)

      await repository.delete(build.id)

      await assert.rejects(repository.findById(build.id), NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma build não existente', async () => {
      await assert.rejects(repository.delete(9999), NotFoundError)
    })
  })

  describe('deleteByEquipment', () => {
    it('Deve deletar uma build do banco de dados', async () => {
      const build = repository.create({ equipment: 'equipment', content: 'content' })

      await repository.insert(build)

      await repository.deleteByEquipment(build.equipment)

      await assert.rejects(repository.deleteByEquipment(build.equipment), NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma build não existente', async () => {
      await assert.rejects(repository.deleteByEquipment('not-exist'), NotFoundError)
    })
  })

  describe('conflictingEquipment', () => {
    it('Deve retornar um erro quando o equipamento já existir', async () => {
      const build = repository.create({ equipment: 'equipment', content: 'content' })
      await repository.insert(build)

      await assert.rejects(repository.conflictingEquipment('equipment'), ConflictError)
    })

    it('Não deve retornar um erro quando o equipamento não existir', async () => {
      await assert.doesNotReject(repository.conflictingEquipment('not-exist'))
    })
  })

  describe('findById', () => {
    it('Deve retornar uma build quando o id existir', async () => {
      const build = repository.create({ equipment: 'equipment', content: 'content' })
      await repository.insert(build)

      const foundBuild = await repository.findById(build.id)

      assert.deepStrictEqual(foundBuild, build)
    })

    it('Deve retornar um erro quando o id não existir', async () => {
      await assert.rejects(repository.findById(9999), NotFoundError)
    })
  })

  describe('search', () => {
    it('Deve retornar uma lista de builds', async () => {
      await repository.insert(repository.create({ equipment: 'equipment 1', content: 'content 1' }))
      await repository.insert(repository.create({ equipment: 'equipment 2', content: 'content 2' }))

      const result = await repository.search({})

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.total, 2)
    })

    it('Deve retornar uma lista vazia quando não houver builds', async () => {
      const result = await repository.search({})

      assert.strictEqual(result.data.length, 0)
      assert.strictEqual(result.total, 0)
    })

    it('Deve retornar uma lista de builds com paginação', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.insert(repository.create({ equipment: `equipment ${i}`, content: `content ${i}` }))
      }

      const resultPage1 = await repository.search({ page: 1, per_page: 10 })
      assert.strictEqual(resultPage1.data.length, 10)
      assert.strictEqual(resultPage1.total, 15)
      assert.strictEqual(resultPage1.current_page, 1)
      assert.strictEqual(resultPage1.per_page, 10)

      const resultPage2 = await repository.search({ page: 2, per_page: 10 })
      assert.strictEqual(resultPage2.data.length, 5)
      assert.strictEqual(resultPage2.total, 15)
      assert.strictEqual(resultPage2.current_page, 2)
    })

    it('Deve retornar uma lista de builds com filtro', async () => {
      await repository.insert(repository.create({ equipment: 'sword of fire', content: 'c' }))
      await repository.insert(repository.create({ equipment: 'shield of ice', content: 'c' }))
      await repository.insert(repository.create({ equipment: 'sword of ice', content: 'c' }))

      const result = await repository.search({ filter: { equipment: 'sword' } })

      assert.strictEqual(result.data.length, 2)
      assert.strictEqual(result.total, 2)
    })
  })
})
