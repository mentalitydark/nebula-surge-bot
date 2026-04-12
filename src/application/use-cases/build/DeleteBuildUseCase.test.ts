import { NotFoundError } from "#errors";
import { BuildsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateBuildUseCase } from "./CreateBuildUseCase.js";
import { DeleteBuildUseCase } from "./DeleteBuildUseCase.js";
import { FindBuildByIdUseCase } from "./FindBuildByIdUseCase.js";

describe('DeleteBuildUseCase - Testes Unitários', () => {
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

  it('Deve remover uma build', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const build = await createUseCase.execute({ equipament: 'equipament', content: 'content' })

    assert.ok(build.id)
    
    const deleteUseCase = new DeleteBuildUseCase(repository)
    await deleteUseCase.execute(build.id)

    const findByIdUseCase = new FindBuildByIdUseCase(repository)

    await assert.rejects(findByIdUseCase.execute(build.id), NotFoundError)
  })

  it('Deve retornar um erro quando o equipamento não existir', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new DeleteBuildUseCase(repository)
    
    await assert.rejects(useCase.execute(0), NotFoundError)
  })
})