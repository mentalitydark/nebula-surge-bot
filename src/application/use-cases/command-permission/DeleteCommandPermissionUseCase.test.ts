import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionModel } from "#entities";
import { NotFoundError } from "#errors";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { DeleteCommandPermissionUseCase } from "./DeleteCommandPermissionUseCase.js";

describe('DeleteCommandPermissionUseCase - Testes Unitários', () => {
  let repository: CommandPermissionTypeormRepository;
  let createUseCase: CreateCommandPermissionUseCase;
  let deleteUseCase: DeleteCommandPermissionUseCase;
  let cache: CacheProviderInterface<CommandPermissionModel>;
  let cacheArray: CacheProviderInterface<CommandPermissionModel[]>;

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()

    cache = InMemoryCacheProvider.getInstance('command-permissions:id')
    cacheArray = InMemoryCacheProvider.getInstance('command-permissions:array')

    repository = new CommandPermissionTypeormRepository()
    createUseCase = new CreateCommandPermissionUseCase(repository, cache, cacheArray)
    deleteUseCase = new DeleteCommandPermissionUseCase(repository, cache, cacheArray)
  })

  beforeEach(async () => {
    await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
    cache.clear()
    cacheArray.clear()
  })

  after(async () => {
    if (dataSource.isInitialized) {
      await dataSource.createQueryBuilder().delete().from('command_permissions').execute()
      await dataSource.destroy()
    }
  })

  it('Deve remover uma permissão', async () => {
    const permission = await createUseCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    })

    await deleteUseCase.execute(permission.id)

    await assert.rejects(repository.findById(permission.id), NotFoundError)
  })

  it('Deve retornar um erro quando a permissão não existir', async () => {
    await assert.rejects(deleteUseCase.execute(999), NotFoundError)
  })
})