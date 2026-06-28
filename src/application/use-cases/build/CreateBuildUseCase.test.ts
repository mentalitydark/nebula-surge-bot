import { ConflictError } from "#errors";
import { BuildsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateBuildUseCase } from "./CreateBuildUseCase.js";

describe('CreateBuildUseCase - Testes Unitários', () => {
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

  it('Deve criar uma build', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new CreateBuildUseCase(repository)
    const build = await useCase.execute({ equipment: 'equipment', content: 'content' })

    assert.ok(build.id)
    assert.strictEqual(build.equipment, 'equipment')
    assert.strictEqual(build.content, 'content')
    assert.ok(build.createdAt)
    assert.ok(build.updatedAt)
  })

  it('Deve retornar um erro quando o equipamento já existir', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new CreateBuildUseCase(repository)
    const build = await useCase.execute({ equipment: 'equipment', content: 'content' })

    assert.ok(build.id)

    await assert.rejects(useCase.execute({ equipment: 'equipment', content: 'content' }), ConflictError)
  })
})