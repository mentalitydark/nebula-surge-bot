import { NotFoundError } from "#errors";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { FindCommandPermissionByIdUseCase } from "./FindCommandPermissionByIdUseCase.js";

describe('FindCommandPermissionByIdUseCase - Testes Unitários', () => {
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

  it('Deve retornar uma permissão quando existir', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const createUseCase = new CreateCommandPermissionUseCase(repository)

    const permission = await createUseCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    })

    assert.ok(permission.id)

    const findUseCase = new FindCommandPermissionByIdUseCase(repository)
    const response = await findUseCase.execute(permission.id)

    assert.strictEqual(response.id, permission.id)
    assert.strictEqual(response.command, permission.command)
    assert.strictEqual(response.role, permission.role)
    assert.strictEqual(response.guild, permission.guild)
    assert.ok(response.createdAt)
    assert.ok(response.updatedAt)
  })

  it('Deve retornar um erro quando a permissão não existir', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const findUseCase = new FindCommandPermissionByIdUseCase(repository)

    await assert.rejects(findUseCase.execute(999), NotFoundError)
  })
})
