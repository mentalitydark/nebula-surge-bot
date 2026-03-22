import { ConflictError, NotFoundError } from "#errors"
import { dataSource } from "#typeorm"
import { BuildsTypeormRepository } from "./BuildsTypeormRepository.js"

describe('BuildsTypeormRepository - Testes Unitários', () => {
  let repository: BuildsTypeormRepository

  beforeAll(async () => {
    await dataSource.initialize()
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('builds').execute()
    repository = new BuildsTypeormRepository()
  })

  afterEach(async () => {})

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('builds').execute()
      await dataSource.createQueryBuilder().delete().from('SQLITE_SEQUENCE').where('name = :name', { name: 'builds' }).execute()
      await dataSource.destroy()
    }
  })

  describe('findByEquipament', () => {
    it('Deve retornar um erro quando o equipamento não existir', async () => {
      await expect(repository.findByEquipament('not-exist')).rejects.toThrow(NotFoundError)
    })

    it('Deve retornar uma build quando o equipamento existir', async () => {
      const equipament = repository.create({ equipament: 'equipament', content: 'content' })
      await repository.insert(equipament)

      const build = await repository.findByEquipament('equipament')

      expect(build).toEqual(equipament)
      expect(build.id).toBeDefined()
      expect(build.createdAt).toBeDefined()
      expect(build.updatedAt).toBeDefined()
    })
  })

  describe('insert', () => {
    it('Deve inserir uma build no banco de dados', async () => {
      const equipament = repository.create({ equipament: 'equipament', content: 'content' })

      const build = await repository.insert(equipament)

      expect(build.id).toBeDefined()
      expect(build.createdAt).toBeDefined()
      expect(build.updatedAt).toBeDefined()
    })

    it('Deve retornar um erro ao inserir uma build já existente', async () => {
      await repository.insert(repository.create({ equipament: 'error equipament', content: '' }))

      await expect(repository.insert(repository.create({ equipament: 'error equipament', content: '' }))).rejects.toThrow(Error)
    })
  })

  describe('update', () => {
    it('Deve atualizar uma build no banco de dados', async () => {
      const build = repository.create({ equipament: 'equipament', content: 'content' })
      await repository.insert(build)

      build.equipament = 'new equipament'
      build.content = 'new content'

      const updatedBuild = await repository.update(build)

      expect(updatedBuild.equipament).toEqual('new equipament')
      expect(updatedBuild.content).toEqual('new content')
      expect(updatedBuild.id).toBeDefined()
      expect(updatedBuild.createdAt).toBeDefined()
      expect(updatedBuild.updatedAt).toBeDefined()
    })

    it('Deve retornar um erro ao atualizar uma build não existente', async () => {
      await expect(repository.update(repository.create({ equipament: 'error equipament', content: '' }))).rejects.toThrow(NotFoundError)
    })
  
    it('Deve retornar um erro ao atualizar uma build já existente', async () => {
      const build01 = repository.create({ equipament: 'equipament 01', content: 'content' })
      const build02 = repository.create({ equipament: 'equipament 02', content: 'content' })
      await repository.insert(build01)
      await repository.insert(build02)

      build02.equipament = 'equipament 01'

      await expect(repository.update(build02)).rejects.toThrow(Error)
    })
  })

  describe('delete', () => {
    it('Deve deletar uma build do banco de dados', async () => {
      const build = repository.create({ equipament: 'equipament', content: 'content' })
      await repository.insert(build)

      await repository.delete(build.id)

      await expect(repository.findById(build.id)).rejects.toThrow(NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma build não existente', async () => {
      await expect(repository.delete(9999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteByEquipament', () => {
    it('Deve deletar uma build do banco de dados', async () => {
      const build = repository.create({ equipament: 'equipament', content: 'content' })

      await repository.insert(build)

      await repository.deleteByEquipament(build.equipament)

      await expect(repository.deleteByEquipament(build.equipament)).rejects.toThrow(NotFoundError)
    })

    it('Deve retornar um erro ao deletar uma build não existente', async () => {
      await expect(repository.deleteByEquipament('not-exist')).rejects.toThrow(NotFoundError)
    })
  })

  describe('conflitingEquipament', () => {
    it('Deve retornar um erro quando o equipamento já existir', async () => {
      const build = repository.create({ equipament: 'equipament', content: 'content' })
      await repository.insert(build)

      await expect(repository.conflitingEquipament('equipament')).rejects.toThrow(ConflictError)
    })

    it('Não deve retornar um erro quando o equipamento não existir', async () => {
      await expect(repository.conflitingEquipament('not-exist')).resolves.not.toThrow()
    })
  })

  describe('findById', () => {
    it('Deve retornar uma build quando o id existir', async () => {
      const build = repository.create({ equipament: 'equipament', content: 'content' })
      await repository.insert(build)

      const foundBuild = await repository.findById(build.id)

      expect(foundBuild).toEqual(build)
    })

    it('Deve retornar um erro quando o id não existir', async () => {
      await expect(repository.findById(9999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('search', () => {
    it('Deve retornar uma lista de builds', async () => {
      await repository.insert(repository.create({ equipament: 'equipament 1', content: 'content 1' }))
      await repository.insert(repository.create({ equipament: 'equipament 2', content: 'content 2' }))

      const result = await repository.search({})

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('Deve retornar uma lista vazia quando não houver builds', async () => {
      const result = await repository.search({})

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  
    it('Deve retornar uma lista de builds com paginação', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.insert(repository.create({ equipament: `equipament ${i}`, content: `content ${i}` }))
      }

      const resultPage1 = await repository.search({ page: 1, per_page: 10 })
      expect(resultPage1.data).toHaveLength(10)
      expect(resultPage1.total).toBe(15)
      expect(resultPage1.current_page).toBe(1)
      expect(resultPage1.per_page).toBe(10)

      const resultPage2 = await repository.search({ page: 2, per_page: 10 })
      expect(resultPage2.data).toHaveLength(5)
      expect(resultPage2.total).toBe(15)
      expect(resultPage2.current_page).toBe(2)
    })

    it('Deve retornar uma lista de builds com filtro', async () => {
      await repository.insert(repository.create({ equipament: 'sword of fire', content: 'c' }))
      await repository.insert(repository.create({ equipament: 'shield of ice', content: 'c' }))
      await repository.insert(repository.create({ equipament: 'sword of ice', content: 'c' }))

      const result = await repository.search({ filter: 'sword' })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })
  })
})