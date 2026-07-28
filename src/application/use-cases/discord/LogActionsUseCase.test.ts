import { GuildSettingsKeys } from '#entities';
import { createMockGuild, createMockSettings, createMockTextChannel } from '#mocks/discordMocks.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { LogActionsUseCase } from './LogActionsUseCase.js';

describe('LogActionsUseCase', () => {
  describe('execute', () => {
    it('Deve lançar erro quando o canal de logs não está configurado', async () => {
      const guild = createMockGuild();
      const settings = createMockSettings({});
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute('mensagem de log'),
        /Canal de logs não configurado/
      );
    });

    it('Deve lançar erro quando o canal não é encontrado', async () => {
      const guild = createMockGuild({ fetchChannelResult: null });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute('mensagem de log'),
        /não é um canal de texto/
      );
    });

    it('Deve lançar erro quando o canal não é um canal de texto', async () => {
      const channel = createMockTextChannel({ isTextBased: false });
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute('mensagem de log'),
        /não é um canal de texto/
      );
    });

    it('Deve enviar a mensagem no canal de logs quando configurado corretamente', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await useCase.execute('mensagem de log');

      assert.strictEqual(channel.send.mock.calls.length, 1);
      const sentMessage = (channel.send.mock.calls as any)[0].arguments[0];
      assert.strictEqual(sentMessage, 'mensagem de log');
    });
  });
});
