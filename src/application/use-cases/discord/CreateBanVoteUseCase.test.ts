import { GuildSettingsKeys } from '#entities';
import { createMockGuild, createMockGuildMember, createMockSettings, createMockTextChannel } from '#mocks/discordMocks.js';
import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { CreateBanVoteUseCase } from './CreateBanVoteUseCase.js';

describe('CreateBanVoteUseCase', () => {
  before(() => {
    // O use case acessa `constants.colors.danger` via global definido em src/constants.ts.
    // Em testes unitários, o bootstrapping do app não é executado, então definimos aqui.
    Object.assign(globalThis, {
      constants: { colors: { danger: '#ED4245' } }
    });
  });

  describe('execute', () => {
    it('Deve lançar erro quando o canal de votação não está configurado', async () => {
      const guild = createMockGuild();
      const settings = createMockSettings({});
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute(createMockGuildMember() as any, 'Motivo'),
        /não configurado/
      );
    });

    it('Deve lançar erro quando o número mínimo de votos não está configurado', async () => {
      const guild = createMockGuild();
      const settings = createMockSettings({ [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id' });
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute(createMockGuildMember() as any, 'Motivo'),
        /Número mínimo de votos/
      );
    });

    it('Deve lançar erro quando o canal não é encontrado', async () => {
      const guild = createMockGuild({ fetchChannelResult: null });
      const settings = createMockSettings({
        [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id',
        [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: 3
      });
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute(createMockGuildMember() as any, 'Motivo'),
        /não é um canal de texto/
      );
    });

    it('Deve lançar erro quando o canal não é um canal de texto', async () => {
      const channel = createMockTextChannel({ isTextBased: false });
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({
        [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id',
        [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: 1
      });
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await assert.rejects(
        () => useCase.execute(createMockGuildMember() as any, 'Motivo'),
        /não é um canal de texto/
      );
    });

    it('Deve enviar embed com informações do membro alvo', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({
        [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id',
        [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: 3
      });
      const userTarget = createMockGuildMember('target-id');
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await useCase.execute(userTarget as any, 'Comportamento inadequado');

      assert.strictEqual(channel.send.mock.calls.length, 1);
      const sendArgs = (channel.send.mock.calls[0].arguments as any[])[0];
      assert.ok(sendArgs?.embeds?.length > 0, 'Deve enviar ao menos um embed');
    });

    it('Deve incluir o número mínimo de votos no embed enviado', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({
        [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id',
        [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: 5
      });
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await useCase.execute(createMockGuildMember() as any, 'Motivo');

      const sendArgs = (channel.send.mock.calls[0].arguments as any[])[0];
      const embedDescription: string = sendArgs?.embeds?.[0]?.data?.description ?? '';
      assert.ok(embedDescription.includes('5'), 'O embed deve mencionar o número mínimo de votos');
    });

    it('Deve reagir com ✅ e ❌ após enviar a mensagem', async () => {
      const channel = createMockTextChannel();
      const guild = createMockGuild({ fetchChannelResult: channel });
      const settings = createMockSettings({
        [GuildSettingsKeys.CHANNEL_AUTO_BAN_VOTE]: 'channel-id',
        [GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD]: 1
      });
      const useCase = new CreateBanVoteUseCase(guild as any, settings as any);

      await useCase.execute(createMockGuildMember() as any, 'Motivo');

      const reactCalls = channel._mockMessage.react.mock.calls.map(
        (c: any) => c.arguments[0]
      );
      assert.ok(reactCalls.includes('✅'), 'Deve reagir com ✅');
      assert.ok(reactCalls.includes('❌'), 'Deve reagir com ❌');
    });
  });
});
