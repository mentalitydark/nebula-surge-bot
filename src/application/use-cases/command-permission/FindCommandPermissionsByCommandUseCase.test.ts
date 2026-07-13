import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionModel } from "#entities";
import { NotFoundError } from "#errors";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { FindCommandPermissionsByCommandUseCase } from "./FindCommandPermissionsByCommandUseCase.js";

describe('FindCommandPermissionsByCommandUseCase - Testes Unitários', () => {
  let repository: CommandPermissionTypeormRepository;
  let createUseCase: CreateCommandPermissionUseCase;
  let findUseCase: FindCommandPermissionsByCommandUseCase;
  let cache: CacheProviderInterface<CommandPermissionModel>;
  let cacheArray: CacheProviderInterface<CommandPermissionModel[]>;

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()

    cache = InMemoryCacheProvider.getInstance('command-permissions:id')
    cacheArray = InMemoryCacheProvider.getInstance('command-permissions:array')

    repository = new CommandPermissionTypeormRepository()
    createUseCase = new CreateCommandPermissionUseCase(repository, cache, cacheArray)
    findUseCase = new FindCommandPermissionsByCommandUseCase(repository, cacheArray)
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

  it('Deve retornar um erro quando não houver permissões', async () => {
    await assert.rejects(findUseCase.execute('test-command', 'test-guild'), NotFoundError)
  })

  it('Deve retornar várias permissões que correspondam ao comando e guild', async () => {
    await createUseCase.execute({ command: 'cmd1', role: 'role1', guild: 'guild1' })
    await createUseCase.execute({ command: 'cmd1', role: 'role2', guild: 'guild1' })

    const response = await findUseCase.execute('cmd1', 'guild1')

    assert.strictEqual(response.length, 2)
    assert.ok(response.some((p) => p.role === 'role1'))
    assert.ok(response.some((p) => p.role === 'role2'))
  })

  it('Deve retornar permissões que satisfaçam os filtros', async () => {
    await createUseCase.execute({ command: 'test-command', role: 'role1', guild: 'guild1' })
    await createUseCase.execute({ command: 'other-command', role: 'role2', guild: 'guild1' })
    await createUseCase.execute({ command: 'test-command', role: 'role3', guild: 'guild2' })

    const response = await findUseCase.execute('test-command', 'guild1')

    assert.strictEqual(response.length, 1)
    assert.strictEqual(response[0].command, 'test-command')
    assert.strictEqual(response[0].guild, 'guild1')
    assert.strictEqual(response[0].role, 'role1')
  })

  it('Deve retornar todas as permissões encontradas independente de quantidade', async () => {
    for (let i = 1; i <= 12; i++) {
      await createUseCase.execute({ command: 'test-command', role: `role${i}`, guild: 'guild1' })
    }

    const response = await findUseCase.execute('test-command', 'guild1')

    assert.strictEqual(response.length, 12)
    assert.ok(response.every(p => p.command === 'test-command' && p.guild === 'guild1'))
  })
})
