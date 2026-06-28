import { NotFoundError } from "#errors";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { DeleteCommandPermissionUseCase } from "./DeleteCommandPermissionUseCase.js";

describe('DeleteCommandPermissionUseCase - Testes Unitários', () => {
  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()
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

  it('Deve remover uma permissão', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const createUseCase = new CreateCommandPermissionUseCase(repository)
    const deleteUseCase = new DeleteCommandPermissionUseCase(repository)

    const permission = await createUseCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    })

    await deleteUseCase.execute(permission.id)

    await assert.rejects(repository.findById(permission.id), NotFoundError)
  })

  it('Deve retornar um erro quando a permissão não existir', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const deleteUseCase = new DeleteCommandPermissionUseCase(repository)

    await assert.rejects(deleteUseCase.execute(999), NotFoundError)
  })
})