import { NotFoundError } from "#errors";
import { BuildsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateBuildUseCase } from "./CreateBuildUseCase.js";
import { FindBuildByIdUseCase } from "./FindBuildByIdUseCase.js";

describe('FindBuildByIdUseCase - Testes Unitários', () => {
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

  it('Deve retornar uma build quando existir', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const build = await createUseCase.execute({ equipament: 'equipament', content: 'content' })

    assert.ok(build.id)
    
    const findByEquipamentUseCase = new FindBuildByIdUseCase(repository)

    const response = await findByEquipamentUseCase.execute(build.id)

    assert.strictEqual(response.equipament, build.equipament)
    assert.strictEqual(response.content, build.content)
    assert.ok(response.createdAt)
    assert.ok(response.updatedAt)
  })

  it('Deve retornar um erro quando a build não existir', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new FindBuildByIdUseCase(repository)
    
    await assert.rejects(useCase.execute(0), NotFoundError)
  })

})