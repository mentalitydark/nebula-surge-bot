import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CommandPermissionModel } from "#entities";
import { InMemoryCacheProvider } from "#infrastructure/providers/InMemoryCacheProvider.js";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";
import { SearchCommandPermissionsUseCase } from "./SearchCommandPermissionsUseCase.js";

describe('SearchCommandPermissionsUseCase - Testes Unitários', () => {
  let repository: CommandPermissionTypeormRepository;
  let createUseCase: CreateCommandPermissionUseCase;
  let searchUseCase: SearchCommandPermissionsUseCase;
  let cache: CacheProviderInterface<CommandPermissionModel>;

  before(async () => {
    await dataSource.initialize()
    await dataSource.synchronize()

    cache = InMemoryCacheProvider.getInstance('command-permissions:id')

    repository = new CommandPermissionTypeormRepository()
    createUseCase = new CreateCommandPermissionUseCase(repository, cache)
    searchUseCase = new SearchCommandPermissionsUseCase(repository)
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

  it('Deve retornar nenhuma permissão quando não houver permissões para o guild', async () => {
    const response = await searchUseCase.execute({ guild: 'guild1' })

    assert.strictEqual(response.data.length, 0)
    assert.strictEqual(response.total, 0)
  })

  it('Deve retornar várias permissões do guild especificado', async () => {
    await createUseCase.execute({ command: 'cmd1', role: 'role1', guild: 'guild1' })
    await createUseCase.execute({ command: 'cmd2', role: 'role2', guild: 'guild1' })
    await createUseCase.execute({ command: 'cmd3', role: 'role3', guild: 'guild2' })

    const response = await searchUseCase.execute({ guild: 'guild1' })

    assert.strictEqual(response.data.length, 2)
    assert.strictEqual(response.total, 2)
    assert.ok(response.data.every(p => p.guild === 'guild1'))
  })

  it('Deve retornar permissões que satisfação os filtros', async () => {
    await createUseCase.execute({ command: 'match', role: 'role1', guild: 'guild1' })
    await createUseCase.execute({ command: 'other', role: 'role2', guild: 'guild1' })
    await createUseCase.execute({ command: 'match', role: 'role3', guild: 'guild2' })

    const response = await searchUseCase.execute({ guild: 'guild1', filter: { command: 'match' } })

    assert.strictEqual(response.data.length, 1)
    assert.strictEqual(response.data[0].command, 'match')
    assert.strictEqual(response.data[0].guild, 'guild1')
    assert.strictEqual(response.total, 1)
  })

  it('Deve retornar permissões com paginação', async () => {
    for (let i = 1; i <= 15; i++) {
      await createUseCase.execute({ command: `cmd${i}`, role: `role${i}`, guild: 'guild1' })
    }

    const responsePage1 = await searchUseCase.execute({ guild: 'guild1', page: 1, per_page: 10 })
    assert.strictEqual(responsePage1.data.length, 10)
    assert.strictEqual(responsePage1.total, 15)

    const responsePage2 = await searchUseCase.execute({ guild: 'guild1', page: 2, per_page: 10 })
    assert.strictEqual(responsePage2.data.length, 5)
    assert.strictEqual(responsePage2.total, 15)
  })

  it('Deve retornar permissões com paginação e filtros', async () => {
    for (let i = 1; i <= 15; i++) {
      await createUseCase.execute({ command: `match${i}`, role: `role${i}`, guild: 'guild1' })
    }
    await createUseCase.execute({ command: `other`, role: `role`, guild: 'guild1' })

    const response = await searchUseCase.execute({ guild: 'guild1', filter: { command: 'match' }, page: 2, per_page: 10 })
    assert.strictEqual(response.data.length, 5)
    assert.strictEqual(response.total, 15)
  })
})