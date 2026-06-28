import { BuildsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateBuildUseCase } from "./CreateBuildUseCase.js";
import { SearchBuildsUseCase } from "./SearchBuildsUseCase.js";

describe('SearchBuildsUseCase - Testes Unitários', () => {
  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
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

  it('Deve retornar nenhuma build quando não houver builds', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new SearchBuildsUseCase(repository)

    const response = await useCase.execute()

    assert.strictEqual(response.data.length, 0)
    assert.strictEqual(response.total, 0)
  })

  it('Deve retornar várias builds quando não informado filtros', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const useCase = new SearchBuildsUseCase(repository)

    await createUseCase.execute({ equipment: 'build 1', content: 'content 1' })
    await createUseCase.execute({ equipment: 'build 2', content: 'content 2' })

    const response = await useCase.execute()

    assert.strictEqual(response.data.length, 2)
    assert.strictEqual(response.total, 2)
  })

  it('Deve retornar builds que satisfação os filtros', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const useCase = new SearchBuildsUseCase(repository)

    await createUseCase.execute({ equipment: 'sword of light', content: 'content 1' })
    await createUseCase.execute({ equipment: 'shield of darkness', content: 'content 2' })

    const response = await useCase.execute({ filter: { equipment: 'sword' } })

    assert.strictEqual(response.data.length, 1)
    assert.strictEqual(response.data[0].equipment, 'sword of light')
    assert.strictEqual(response.total, 1)
  })

  it('Deve retornar builds com paginação', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const useCase = new SearchBuildsUseCase(repository)

    for (let i = 1; i <= 15; i++) {
      await createUseCase.execute({ equipment: `build ${i}`, content: `content ${i}` })
    }

    const responsePage1 = await useCase.execute({ page: 1, per_page: 10 })
    assert.strictEqual(responsePage1.data.length, 10)
    assert.strictEqual(responsePage1.total, 15)
    assert.strictEqual(responsePage1.current_page, 1)

    const responsePage2 = await useCase.execute({ page: 2, per_page: 10 })
    assert.strictEqual(responsePage2.data.length, 5)
    assert.strictEqual(responsePage2.total, 15)
    assert.strictEqual(responsePage2.current_page, 2)
  })

  it('Deve retornar builds com paginação e filtros', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const useCase = new SearchBuildsUseCase(repository)

    for (let i = 1; i <= 15; i++) {
      await createUseCase.execute({ equipment: `match ${i}`, content: `content ${i}` })
    }
    await createUseCase.execute({ equipment: `other`, content: `content` })

    const response = await useCase.execute({ filter: { equipment: 'match' }, page: 2, per_page: 10 })
    assert.strictEqual(response.data.length, 5)
    assert.strictEqual(response.total, 15)
    assert.strictEqual(response.current_page, 2)
  })

})