import { CacheProviderInterface } from "#application/providers/CacheProviderInterface.js";
import { CreateGuildSettingsProps, GuildSettingsRepositoryInterface } from "#application/repositories/GuildSettingsRepositoryInterface.js";
import { SearchInput, SearchOutput } from "#application/repositories/RepositoryInterface.js";
import { SettingStrategyRegistry } from "#application/strategies/SettingStrategyRegistry.js";
import { GuildSettings, GuildSettingsKeys, GuildSettingsModel, Settings } from "#entities";
import { NotFoundError } from "#errors";
import { Guild } from "discord.js";
import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { SetGuildSettingsUseCase } from "./SetGuildSettingsUseCase.js";

// ── Mocks ──────────────────────────────────────────────────────────────────────

class InMemoryGuildSettingsRepository implements GuildSettingsRepositoryInterface {
  private store: GuildSettings[] = [];
  private nextId = 1;

  create(data: CreateGuildSettingsProps): GuildSettings {
    const model = new GuildSettings();
    model.guild = data.guild;
    model.settings = data.settings;
    return model;
  }

  async insert(model: GuildSettings): Promise<GuildSettings> {
    model.id = this.nextId++;
    model.createdAt = new Date();
    model.updatedAt = new Date();
    this.store.push(model);
    return model;
  }

  async findByGuild(guild: string): Promise<GuildSettings> {
    const found = this.store.find((s) => s.guild === guild);
    if (!found) throw new NotFoundError('GuildSettings não encontrado');
    return found;
  }

  async update(model: GuildSettings): Promise<GuildSettings> {
    const index = this.store.findIndex((s) => s.id === model.id);
    model.updatedAt = new Date();
    this.store[index] = model;
    return model;
  }

  async search(_props: SearchInput<GuildSettings>): Promise<SearchOutput<GuildSettings>> {
    return { data: this.store, current_page: 1, per_page: 10, total: this.store.length };
  }

  async findById(id: number): Promise<GuildSettings> {
    const found = this.store.find((s) => s.id === id);
    if (!found) throw new NotFoundError('Não encontrado');
    return found;
  }

  async delete(_id: number): Promise<void> { }
}

class InMemoryCacheMock<T> implements CacheProviderInterface<T> {
  private store = new Map<string | number, T>();
  get(key: string | number): T | null { return this.store.get(key) ?? null; }
  set(key: string | number, value: T): void { this.store.set(key, value); }
  delete(key: string | number): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
}

function makeMockGuild(id: string): Guild {
  return { id } as unknown as Guild;
}

function registerPassthroughStrategy(key: GuildSettingsKeys): void {
  SettingStrategyRegistry.register(key, (guild) => ({
    key,
    description: 'Mock strategy',
    guild,
    validate: async (v) => { return v; },
    apply: (settings: Settings, value: string | string[] | null): Settings => {
      settings.set(key, Array.isArray(value) ? value[0] : value);
      return settings;
    },
    get: (settings: Settings): string | null => {
      return settings.get(key) as string | null;
    }
  }));
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('SetGuildSettingsUseCase', () => {
  let repository: InMemoryGuildSettingsRepository;
  let cache: InMemoryCacheMock<GuildSettingsModel>;
  let useCase: SetGuildSettingsUseCase;

  beforeEach(() => {
    SettingStrategyRegistry.clear();
    registerPassthroughStrategy(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED);
    registerPassthroughStrategy(GuildSettingsKeys.CHANNEL_AUTO_BAN);

    repository = new InMemoryGuildSettingsRepository();
    cache = new InMemoryCacheMock();
    useCase = new SetGuildSettingsUseCase(repository, cache);
  });

  it('Deve criar configuração quando a guild não tiver nenhuma', async () => {
    const guild = makeMockGuild('guild-001');

    const result = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-abc', guild);

    assert.ok(result.id);
    assert.strictEqual(result.guild, 'guild-001');
    assert.strictEqual(result.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel-abc');
    assert.ok(result.createdAt);
    assert.ok(result.updatedAt);
  });

  it('Deve atualizar configuração existente', async () => {
    const guild = makeMockGuild('guild-001');

    await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-abc', guild);
    const updated = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-xyz', guild);

    assert.strictEqual(updated.settings?.get(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED), 'channel-xyz');
  });

  it('Deve manter o mesmo ID ao atualizar', async () => {
    const guild = makeMockGuild('guild-001');

    const first = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-1', guild);
    const second = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-2', guild);

    assert.strictEqual(first.id, second.id);
  });

  it('Deve atualizar o cache após inserir', async () => {
    const guild = makeMockGuild('guild-001');

    const result = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-abc', guild);

    assert.deepStrictEqual(cache.get('guild-001'), result);
  });

  it('Deve atualizar o cache após atualizar', async () => {
    const guild = makeMockGuild('guild-001');

    await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-1', guild);
    const updated = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-2', guild);

    assert.deepStrictEqual(cache.get('guild-001'), updated);
  });

  it('Deve criar configurações separadas para guilds diferentes', async () => {
    const guild1 = makeMockGuild('guild-001');
    const guild2 = makeMockGuild('guild-002');

    const s1 = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-1', guild1);
    const s2 = await useCase.execute(GuildSettingsKeys.CHANNEL_MESSAGES_REMOVED, 'channel-2', guild2);

    assert.notStrictEqual(s1.id, s2.id);
    assert.strictEqual(s1.guild, 'guild-001');
    assert.strictEqual(s2.guild, 'guild-002');
  });

  it('Deve lançar erro quando nenhuma estratégia estiver registrada para a chave', async () => {
    const guild = makeMockGuild('guild-001');

    await assert.rejects(
      () => useCase.execute(GuildSettingsKeys.CHANNEL_LOGS, 'channel-abc', guild),
    );
  });

  it('Deve propagar o erro lançado pela validação da estratégia', async () => {
    const guild = makeMockGuild('guild-001');

    SettingStrategyRegistry.register(GuildSettingsKeys.CHANNEL_LOGS, (_guild) => ({
      key: GuildSettingsKeys.CHANNEL_LOGS,
      description: 'Mock failing strategy',
      guild: _guild,
      validate: async () => { throw new Error('Validação falhou'); },
      apply: (s: Settings) => s,
      get: (s: Settings) => s.get(GuildSettingsKeys.CHANNEL_LOGS)
    }));

    await assert.rejects(
      () => useCase.execute(GuildSettingsKeys.CHANNEL_LOGS, 'channel-abc', guild),
      /Validação falhou/
    );
  });
});

