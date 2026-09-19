# Camada de Presentation/Adapters

A camada de presentation (ou adapters) é responsável por traduzir entre o mundo externo (como frameworks, bibliotecas, dispositivos de entrada/saída) e os casos de uso da aplicação. Ela não contém regras de negócio, mas sim lida com preocupações de entrada e saída.

## Responsabilidades

- **Controllers/Handlers**: Receber entradas do sistema externo (como comandos do Discord, requisições HTTP, eventos de fila) e traduzi-los para chamadas de casos de uso.
- **Presenters**: Formatando a saída dos casos de uso para ser adequada ao consumidor externo (como mensagens do Discord, respostas JSON, etc.).
- **Middleware/Guards**: Tratar preocupações transversais como autenticação, autorização, logging, validação de entrada, etc.
- **DTOs Externos**: Estruturas de dados específicas para comunicação com frameworks externos (por exemplo, objetos específicos do discord.js para mensagens).
- **Configuração de Frameworks**: Setup e configuração de bibliotecas externas (como discord.js, express, etc.).

## Características

- **Depende da camada de application**: Importa casos de uso e DTOs de application para orquestrar as operações de negócio.
- **Não contém regras de negócio**: Toda lógica de negócio deve ficar na camada de application ou domain.
- **Conhece detalhes de frameworks externos**: É a única camada que deve importar e usar bibliotecas externas como discord.js, express, etc.
- **Testabilidade**: Pode ser testada, mas geralmente requer mocks dos frameworks externos ou testes de integração com eles.
- **Pontos de entrada**: Define os pontos de entrada da aplicação (como comandos do bot, rotas de API, etc.).

## Exemplo de Estrutura

```
presentation/
├── discord/
│   ├── commands/
│   │   ├── UserCommand.ts
│   │   └── GuildCommand.ts
│   ├── events/
│   │   ├── ReadyEvent.ts
│   │   └── MessageEvent.ts
│   ├── middlewares/
│   │   ├── AuthMiddleware.ts
│   │   └── GuildMiddleware.ts
│   └── DiscordBot.ts
├── dtos/
│   ├── discord/
│   │   ├── CreateUserDiscord.dto.ts
│   │   └── GetUserDiscord.dto.ts
│   └── http/
│       └── ... (se houver API REST)
├── controllers/
│   └── ... (se houver outros tipos de controllers, como HTTP)
└── presenters/
    ├── discord/
    │   ├── UserPresenter.ts
    │   └── GuildPresenter.ts
    └── http/
        └── ... (se houver API REST)
```

### Command do Discord (Exemplo)

```typescript
import { Interaction } from 'discord.js';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUser.use-case';
import { CreateUserDto } from '../../../application/dtos/user/CreateUser.dto';
import { UserPresenter } from './User.presenter';

export class UserCommand {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userPresenter: UserPresenter,
  ) {}

  async execute(interaction: Interaction): Promise<void> {
    // Extrair dados da interação do Discord
    const username = interaction.user.username;
    const email = interaction.options.getString('email', true);

    // Criar DTO para o caso de uso
    const dto = new CreateUserDto(email, username);

    try {
      // Executar o caso de uso
      const user = await this.createUserUseCase.execute(dto);

      // Apresentar o resultado
      const message = this.userPresenter.present(user);
      await interaction.reply(message);
    } catch (error) {
      // Tratar erros (poderia usar um middleware de tratamento de erros)
      await interaction.reply(`Erro: ${error.message}`);
    }
  }
}
```

### Presenter (Exemplo)

```typescript
import { User } from '../../../../domain/entities/User.entity';

export class UserPresenter {
  present(user: User): string {
    return `Usuário criado com sucesso!\n` +
           `ID: ${user.id}\n` +
           `Nome: ${user.name}\n` +
           `E-mail: ${user.email.getValue()}\n` +
           `Criado em: ${user.createdAt.toLocaleString()}`;
  }
}
```

### Middleware (Exemplo: Autenticação)

```typescript
import { Interaction } from 'discord.js';
import { GuildMember } from 'discord.js';

export class AuthMiddleware {
  async execute(interaction: Interaction, next: () => Promise<void>): Promise<void> {
    // Verificar se o usuário é membro da guilda
    if (!interaction.inGuild()) {
      await interaction.reply('Este comando só pode ser usado dentro de um servidor.');
      return;
    }

    // Verificar se o usuário tem alguma role específica (opcional)
    const member = interaction.member as GuildMember;
    if (!member?.roles.cache.has('SOME_ROLE_ID')) {
      await interaction.reply('Você não tem permissão para usar este comando.');
      return;
    }

    // Se tudo estiver ok, chamar o próximo middleware ou o command
    await next();
  }
}
```

## Regras Importantes

1. **Não coloque regras de negócio aqui**: Toda lógica de negócio deve ficar na camada de application ou domain. Esta camada apenas traduz entre o externo e o interno.
2. **Use DTOs para frente aos casos de uso**: Não passe entidades de domain diretamente para os casos de uso; converta para DTOs de application primeiro.
3. **Tratamento de erros de presentation**: Erros que são específicos da camada de presentation (como falhas de validação de entrada do Discord) podem ser tratados aqui, mas erros de negócio devem ser deixados para propagar e serem tratados pelos casos de uso ou por um middleware de tratamento de erros centralizado.
4. **Mantenha os controllers/focados**: Cada command ou handler deve ter uma única responsabilidade (SRP).
5. **Use middlewares para preocupações transversais**: Autenticação, logging, validação de entrada, etc., devem ser implementados como middlewares quando possível.
6. **Não vaze detalhes de infrastructure**: Não importa nada de infrastructure diretamente aqui; se precisar de algo de infrastructure (como enviar um email), faça isso através de um caso de uso ou serviço de application.
7. **Injeção de Dependência**: Os controllers, handlers, middlewares e presenters devem ter suas dependências (como casos de uso e apresentadores) injetadas via construtor.

## Como Esta Camada Interage com as Outras

- Recebe entrada do mundo exterior (como comandos do Discord) e a traduz para DTOs de application.
- Chama os casos de uso da camada de application com esses DTOs.
- Recebe a saída dos casos de uso (geralmente entidades de domain ou DTOs de application) e usa presenters para formatá-la adequadamente para o mundo exterior.
- Pode usar middlewares para processar a entrada antes de chegar aos comandos (como validação, autenticação, etc.).
- Não deve importar nada de domain diretamente (exceto talvez para tipos muito básicos que são seguros, mas prefira sempre ir via application).
- Não deve importar nada de infrastructure diretamente; se precisar de algo de infrastructure, deve ir através de application (por exemplo, um caso de uso que use um serviço de infrastructure).

## Decisões de Tecnologia no Projeto

No projeto Nebula Surge Bot, a camada de presentation utiliza:
- **Framework Discord**: discord.js para interagir com a API do Discord.
- **Estrutura de comandos baseada em interactions** (slash commands) ou mensagens tradicionais, dependendo da implementação existente.
- **Middlewares** para autenticação, logging e outras preocupações transversais.