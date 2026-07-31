import { createMockCollection, createMockGuild, createMockGuildMember, createMockMessage, createMockTextChannel } from '#mocks/discordMocks.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { RemoveUserMessagesUseCase } from './RemoveUserMessagesUseCase.js';

describe('RemoveUserMessagesUseCase', () => {
  describe('execute', () => {
    it('Deve retornar 0 quando não há canais na guild', async () => {
      const guild = createMockGuild({ fetchChannelsResult: createMockCollection() });
      const userTarget = createMockGuildMember();
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 0);
    });

    it('Deve retornar 0 quando o canal não é de texto', async () => {
      const channel = createMockTextChannel({ isTextBased: false });
      const channels = createMockCollection([['channel-id', channel]]);
      const guild = createMockGuild({ fetchChannelsResult: channels as any });
      const userTarget = createMockGuildMember();
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 0);
      assert.strictEqual(channel.messages.fetch.mock.calls.length, 0);
    });

    it('Deve retornar 0 quando o usuário não tem permissão de enviar mensagens', async () => {
      const channel = createMockTextChannel({ canSendMessages: false });
      const channels = createMockCollection([['channel-id', channel]]);
      const guild = createMockGuild({ fetchChannelsResult: channels as any });
      const userTarget = createMockGuildMember();
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 0);
    });

    it('Deve retornar 0 quando o usuário não tem mensagens no canal', async () => {
      const channel = createMockTextChannel({ userMessages: [] });
      const channels = createMockCollection([['channel-id', channel]]);
      const guild = createMockGuild({ fetchChannelsResult: channels as any });
      const userTarget = createMockGuildMember('target-id');
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 0);
      assert.strictEqual(channel.bulkDelete.mock.calls.length, 0);
    });

    it('Deve deletar as mensagens do usuário e retornar a contagem', async () => {
      const targetId = 'target-id';
      const userMsgs: [string, ReturnType<typeof createMockMessage>][] = [
        ['msg-1', createMockMessage(targetId)],
        ['msg-2', createMockMessage(targetId)],
      ];
      const channel = createMockTextChannel({ userMessages: userMsgs });
      const channels = createMockCollection([['channel-id', channel]]);
      const guild = createMockGuild({ fetchChannelsResult: channels as any });
      const userTarget = createMockGuildMember(targetId);
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 2);
      assert.strictEqual(channel.bulkDelete.mock.calls.length, 1);
    });

    it('Deve somar mensagens deletadas de múltiplos canais', async () => {
      const targetId = 'target-id';
      const channel1 = createMockTextChannel({
        id: 'channel-1',
        userMessages: [['msg-1', createMockMessage(targetId)]]
      });
      const channel2 = createMockTextChannel({
        id: 'channel-2',
        userMessages: [
          ['msg-2', createMockMessage(targetId)],
          ['msg-3', createMockMessage(targetId)]
        ]
      });
      const channels = createMockCollection([
        ['channel-1', channel1],
        ['channel-2', channel2]
      ]);
      const guild = createMockGuild({ fetchChannelsResult: channels as any });
      const userTarget = createMockGuildMember(targetId);
      const useCase = new RemoveUserMessagesUseCase(guild as any);

      const result = await useCase.execute(userTarget as any);

      assert.strictEqual(result, 3);
    });
  });
});
