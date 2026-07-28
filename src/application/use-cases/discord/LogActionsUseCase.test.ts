import { GuildSettingsKeys } from '#entities';
import { createMockGuild, createMockSettings, createMockTextChannel } from '#mocks/discordMocks.js';
import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { LogActionsUseCase } from './LogActionsUseCase.js';

describe('LogActionsUseCase', () => {
  before(() => {
    Object.assign(globalThis, {
      constants: { colors: { default: '#2B2D31' } }
    });
  });

  describe('execute', () => {
    it('Deve lançar erro quando o canal de logs não está configurado', async () => {
      const guild = createMockGuild();
      const settings = createMockSettings({});
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute({ message: 'mensagem de log' }),
        /Canal de logs não configurado/
      );
    });

    it('Deve lançar erro quando o canal não é encontrado', async () => {
      const guild = createMockGuild({ fetchChannelResult: null });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute({ message: 'mensagem de log' }),
        /não é um canal de texto/
      );
    });

    it('Deve lançar erro quando o canal não é um canal de texto', async () => {
      const channel = createMockTextChannel({ isTextBased: false });
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute({ message: 'mensagem de log' }),
        /não é um canal de texto/
      );
    });

    it('Deve enviar embed com a mensagem quando configurado corretamente', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await useCase.execute({ message: 'mensagem de log' });

      assert.strictEqual(channel.send.mock.calls.length, 1);
      const sentArgs = (channel.send.mock.calls as any)[0].arguments[0];
      assert.ok(sentArgs?.embeds?.length > 0, 'Deve enviar ao menos um embed');
    });

    it('Deve usar title e color personalizados quando fornecidos', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_LOGS]: 'channel-id' });
      const useCase = new LogActionsUseCase(guild as any, settings as any);

      await useCase.execute({ message: 'msg', title: 'Título Custom', color: '#ff0000' });

      assert.strictEqual(channel.send.mock.calls.length, 1);
    });
  });
});
