import { ConflictError } from "#errors";
import { CommandPermissionTypeormRepository } from "#repositories";
import { dataSource } from "#typeorm";
import assert from "node:assert";
import { after, before, beforeEach, describe, it } from "node:test";
import { CreateCommandPermissionUseCase } from "./CreateCommandPermissionUseCase.js";

describe('CreateCommandPermissionUseCase - Testes Unitários', () => {
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

  it('Deve criar uma permissão para Role, Command e Guild', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const useCase = new CreateCommandPermissionUseCase(repository)

    const permission = await useCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    })

    assert.ok(permission.id)
    assert.strictEqual(permission.command, 'test-command')
    assert.strictEqual(permission.role, 'test-role')
    assert.strictEqual(permission.guild, 'test-guild')
  })

  it('Deve retornar um erro quando já existir uma permissão para o grupo Role, Command e Guild', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const useCase = new CreateCommandPermissionUseCase(repository)

    const data = {
      command: 'test-command',
      role: 'test-role',
      guild: 'test-guild'
    }

    await useCase.execute(data)

    await assert.rejects(useCase.execute(data), ConflictError)
  })

  it('Deve criar uma nova permissão para os mesmos dados de Role e Command com Guild diferente', async () => {
    const repository = new CommandPermissionTypeormRepository()
    const useCase = new CreateCommandPermissionUseCase(repository)

    await useCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'guild-1'
    })

    const permission = await useCase.execute({
      command: 'test-command',
      role: 'test-role',
      guild: 'guild-2'
    })

    assert.ok(permission.id)
    assert.strictEqual(permission.guild, 'guild-2')
  })
})