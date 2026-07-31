import { mock } from 'node:test';

/**
 * Coleção simulada do Discord com suporte aos métodos filter e size (compatível com Collection do discord.js).
 */
export function createMockCollection<K, V>(entries: [K, V][] = []) {
  const map = new Map<K, V>(entries);
  return Object.assign(map, {
    filter(fn: (value: V, key: K) => boolean) {
      const result = createMockCollection<K, V>();
      for (const [key, value] of map.entries()) {
        if (fn(value, key)) result.set(key, value);
      }
      return result;
    }
  });
}

/**
 * Cria um mock de mensagem do Discord.
 */
export function createMockMessage(authorId = 'author-id') {
  return {
    id: 'message-id',
    author: { id: authorId },
    react: mock.fn(async (_emoji: string) => { })
  };
}

/**
 * Cria um mock de canal de texto do Discord.
 */
export function createMockTextChannel(options: {
  id?: string;
  isTextBased?: boolean;
  userMessages?: [string, ReturnType<typeof createMockMessage>][];
  canSendMessages?: boolean;
} = {}) {
  const {
    id = 'channel-id',
    isTextBased = true,
    userMessages = [],
    canSendMessages = true,
  } = options;

  const mockMessage = createMockMessage();
  const messagesCollection = createMockCollection(userMessages);

  return {
    id,
    isTextBased: () => isTextBased,
    send: mock.fn(async () => mockMessage),
    messages: {
      fetch: mock.fn(async () => messagesCollection)
    },
    permissionsFor: mock.fn(() => ({
      has: (_perm: string) => canSendMessages
    })),
    bulkDelete: mock.fn(async () => createMockCollection()),
    /** Referência direta à mensagem retornada por send(), para inspeção em testes. */
    _mockMessage: mockMessage
  };
}

/**
 * Cria um mock de GuildMember do Discord.
 */
export function createMockGuildMember(id = 'member-id') {
  return { id };
}

/**
 * Cria um mock de Guild do Discord.
 *
 * - `fetchChannelResult`: valor retornado por `channels.fetch(id)` — usado em use cases que buscam um canal específico.
 * - `fetchChannelsResult`: valor retornado por `channels.fetch()` (sem args) — usado em use cases que listam todos os canais.
 */
export function createMockGuild(options: {
  fetchChannelResult?: ReturnType<typeof createMockTextChannel> | null;
  fetchChannelsResult?: ReturnType<typeof createMockCollection>;
} = {}) {
  const {
    fetchChannelResult = null,
    fetchChannelsResult = createMockCollection(),
  } = options;

  return {
    id: 'guild-id',
    members: {
      ban: mock.fn(async () => { })
    },
    channels: {
      fetch: mock.fn(async (id?: string) => {
        if (id !== undefined) return fetchChannelResult;
        return fetchChannelsResult;
      })
    }
  };
}

/**
 * Cria um mock de Settings (entidade de domínio).
 */
export function createMockSettings(values: Record<string, unknown> = {}) {
  return {
    get: mock.fn((key: string) => values[key] ?? null),
    set: mock.fn(),
    has: mock.fn((key: string) => key in values && values[key] !== null),
    delete: mock.fn()
  };
}
