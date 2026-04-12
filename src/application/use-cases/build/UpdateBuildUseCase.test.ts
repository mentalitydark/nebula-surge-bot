import { ConflictError, NotFoundError } from "#errors";
import { BuildsTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateBuildUseCase } from "./CreateBuildUseCase.js";
import { UpdateBuildUseCase } from "./UpdateBuildUseCase.js";

describe('UpdateBuildUseCase - Testes Unitários', () => {
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

  it('Deve retornar um erro quando a build não existir', async () => {
    const repository = new BuildsTypeormRepository()
    const useCase = new UpdateBuildUseCase(repository)

    await assert.rejects(useCase.execute(999, { equipament: 'new', content: 'content' }), NotFoundError)
  })

  it('Deve atualizar uma build', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const updateUseCase = new UpdateBuildUseCase(repository)

    const build = await createUseCase.execute({ equipament: 'original', content: 'content' })

    const updatedBuild = await updateUseCase.execute(build.id, { equipament: 'updated', content: 'new content' })

    assert.strictEqual(updatedBuild.id, build.id)
    assert.strictEqual(updatedBuild.equipament, 'updated')
    assert.strictEqual(updatedBuild.content, 'new content')
  })

  it('Deve retornar um erro quando atualizar uma build alterando o equipamento para um já utilizado', async () => {
    const repository = new BuildsTypeormRepository()
    const createUseCase = new CreateBuildUseCase(repository)
    const updateUseCase = new UpdateBuildUseCase(repository)

    await createUseCase.execute({ equipament: 'existing', content: 'content' })
    const buildToUpdate = await createUseCase.execute({ equipament: 'to update', content: 'content' })

    await assert.rejects(
      updateUseCase.execute(buildToUpdate.id, { equipament: 'existing', content: 'content' }),
      ConflictError
    )
  })
})