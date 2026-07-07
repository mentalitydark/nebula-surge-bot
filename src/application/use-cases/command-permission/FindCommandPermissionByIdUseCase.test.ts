import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionModel } from "#entities";
import { NotFoundError } from "#errors";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { FindCommandPermissionByIdUseCase } from "./FindCommandPermissionByIdUseCase.js";

describe('FindCommandPermissionByIdUseCase - Testes Unitários', () => {
  let repository: CommandPermissionTypeormRepository;
  let createUseCase: CreateCommandPermissionUseCase;
  let findUseCase: FindCommandPermissionByIdUseCase;
  let cache: CacheProviderInterface<CommandPermissionModel>;

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()

    cache = InMemoryCacheProvider.getInstance('command-permissions:id')

    repository = new CommandPermissionTypeormRepository()
    createUseCase = new CreateCommandPermissionUseCase(repository, cache)
    findUseCase = new FindCommandPermissionByIdUseCase(repository, cache)
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
    cache.clear()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
      await dataSource.destroy()
    }
  })

  it('Deve retornar uma permissão quando existir', async () => {
    const permission = await createUseCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    })

    assert.ok(permission.id)

    const response = await findUseCase.execute(permission.id)

    assert.strictEqual(response.id, permission.id)
    assert.strictEqual(response.command, permission.command)
    assert.strictEqual(response.role, permission.role)
    assert.strictEqual(response.guild, permission.guild)
    assert.ok(response.createdAt)
    assert.ok(response.updatedAt)
  })

  it('Deve retornar um erro quando a permissão não existir', async () => {
    await assert.rejects(findUseCase.execute(999), NotFoundError)
  })
})
