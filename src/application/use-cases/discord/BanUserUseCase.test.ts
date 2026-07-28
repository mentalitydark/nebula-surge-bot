import { createMockGuild, createMockGuildMember } from '#mocks/discordMocks.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { BanUserUseCase } from './BanUserUseCase.js';

describe('BanUserUseCase', () => {
  describe('execute', () => {
    it('Deve chamar guild.members.ban com o membro e o motivo corretos', async () => {
      const guild = createMockGuild();
      const userTarget = createMockGuildMember();
      const useCase = new BanUserUseCase();

      await useCase.execute(userTarget as any, guild as any, 'Spam no servidor');

      assert.strictEqual(guild.members.ban.mock.calls.length, 1);
      const [calledTarget, calledOptions] = guild.members.ban.mock.calls[0].arguments as any[];
      assert.strictEqual(calledTarget, userTarget);
      assert.strictEqual(calledOptions.reason, 'Spam no servidor');
    });

    it('Deve passar deleteMessageSeconds ao banir o membro', async () => {
      const guild = createMockGuild();
      const userTarget = createMockGuildMember();
      const useCase = new BanUserUseCase();

      await useCase.execute(userTarget as any, guild as any, 'Motivo qualquer');

      const [, calledOptions] = guild.members.ban.mock.calls[0].arguments as any[];
      assert.ok(calledOptions.deleteMessageSeconds, 'deleteMessageSeconds deve estar definido');
      assert.ok(typeof calledOptions.deleteMessageSeconds === 'number');
    });
  });
});
