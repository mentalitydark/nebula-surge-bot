import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { BanUserInterface, BanAuditLogInterface } from '@/application/contracts'
import { BanUserUseCase, type BanUserInput } from './BanUserUseCase'
import { ForbiddenException } from '@/domain/errors'
import { BanPeriod, UserId } from '@/domain/value-objects'

describe('BanUserUseCase', () => {
  let banUserProvider: BanUserInterface
  let auditLogProvider: BanAuditLogInterface
  let sut: BanUserUseCase

  const mockInput: BanUserInput = {
    guildId: '123',
    executorId: '456',
    targetUserId: '789',
    reason: 'Violação reiterada das regras',
    deleteMessagePeriod: BanPeriod.ONE_DAY,
  }

  beforeEach(() => {
    banUserProvider = {
      getMemberInfo: vi.fn().mockResolvedValue({ isStaff: false, isBot: false, id: '789', username: 'user' }),
      ban: vi.fn().mockResolvedValue(undefined),
    }
    auditLogProvider = {
      log: vi.fn().mockResolvedValue(undefined),
    }
    sut = new BanUserUseCase(banUserProvider, auditLogProvider)
  })

  it('não deve permitir que o executor bana a si mesmo', async () => {
    vi.mocked(banUserProvider.getMemberInfo).mockResolvedValueOnce({ isStaff: false, isBot: false, id: '456', username: 'user' })
    const input = { ...mockInput, targetUserId: '456' }

    await expect(sut.execute(input)).rejects.toThrow(ForbiddenException)
    expect(banUserProvider.ban).not.toHaveBeenCalled()
    expect(auditLogProvider.log).not.toHaveBeenCalled()
  })

  it('não deve permitir banir membros da staff', async () => {
    vi.mocked(banUserProvider.getMemberInfo).mockResolvedValueOnce({ isStaff: true, isBot: false, id: '1', username: 'user' })

    await expect(sut.execute(mockInput)).rejects.toThrow(
      new ForbiddenException('Não é possível banir um membro da equipe.')
    )
    expect(banUserProvider.ban).not.toHaveBeenCalled()
    expect(auditLogProvider.log).not.toHaveBeenCalled()
  })

  it('não deve permitir banir bots', async () => {
    vi.mocked(banUserProvider.getMemberInfo).mockResolvedValueOnce({ isStaff: false, isBot: true, id: '1', username: 'user' })

    await expect(sut.execute(mockInput)).rejects.toThrow(
      new ForbiddenException('Não é possível banir um bot.')
    )
    expect(banUserProvider.ban).not.toHaveBeenCalled()
    expect(auditLogProvider.log).not.toHaveBeenCalled()
  })

  it('deve banir o usuário e registrar auditoria com sucesso', async () => {
    await sut.execute(mockInput)

    expect(banUserProvider.ban).toHaveBeenCalledWith({
      guildId: '123',
      userId: '789',
      reason: 'Violação reiterada das regras',
      deleteMessageSeconds: 86400,
    })

    expect(auditLogProvider.log).toHaveBeenCalledWith({
      guildId: '123',
      executorId: UserId.create('456'),
      targetUserId: UserId.create('789'),
      reason: 'Violação reiterada das regras',
      deleteMessageBanPeriodLabel: '24 Horas',
      attachment: undefined,
    })
  })
})