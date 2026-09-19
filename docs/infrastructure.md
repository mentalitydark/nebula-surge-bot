# Camada de Infrastructure

A camada de infrastructure contém as implementações concretas das interfaces definidas na camada de domain. Ela é responsável por lidar com detalhes externos como bancos de dados, APIs de terceiros, sistemas de arquivos e outros recursos externos.

## Responsabilidades

- **Implementações de Repositórios**: Concrete implementations of the repository interfaces defined in domain.
- **Clients de API de Terceiros**: Integração com serviços externos (como APIs do Discord, serviços de pagamento, etc.).
- **Configuração de Bancos de Dados**: Setup e conexão com bancos de dados (TypeORM, Prisma, etc.).
- **Adapters e Mappers**: Conversão entre dados externos e entidades de domain.
- **Serviços de Infraestrutura**: Funcionalidades como logging, caching, envio de emails, armazenamento de arquivos, etc.

## Características

- **Depende de domain e de bibliotecas externas**: Importa interfaces de domain e implementa-as usando bibliotecas específicas (TypeORM, Prisma, axios, discord.js, etc.).
- **Não deve vazar detalhes de infrastructure para outras camadas**: As camadas de domain e application não devem saber se estamos usando um banco de dados relacional ou NoSQL, ou se estamos usando uma biblioteca específica para chamadas HTTP.
- **Testabilidade**: Pode ser testada, mas geralmente requer testes de integração ou mocks de serviços externos.
- **Substituibilidade**: Devido à injeção de dependência, é possível trocar uma implementação por outra (por exemplo, mudar de TypeORM para Prisma) sem afetar domain ou application, desde que ambas implementem as mesmas interfaces.

## Exemplo de Estrutura

```
infrastructure/
├── persistence/
│   ├── typeorm/
│   │   ├── User.typeorm-entity.ts
│   │   └── User.typeorm-repository.ts
│   └── prisma/
│       ├── User.prisma-entity.ts
│       └── User.prisma-repository.ts
├── api-clients/
│   └── DiscordClient.ts
├── services/
│   ├── EmailService.ts
│   └── StorageService.ts
└── config/
    └── Database.config.ts
```

### Implementação de Repositório (Exemplo com TypeORM)

```typescript
import { User } from '../../../../domain/entities/User.entity';
import { UserRepository } from '../../../../domain/repositories/User.repository';
import { Email } from '../../../../domain/value-objects/Email.value-object';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserTypeORMRepository implements UserRepository {
  private readonly repository: Repository<User>;

  constructor() {
    // In a real app, you'd inject the connection or use TypeORM's data source
    this.repository = /* get repository from connection */;
  }

  async save(user: User): Promise<void> {
    // Convert domain entity to TypeORM entity if needed
    // Here we assume the domain entity is compatible or we map it
    await this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.repository.findOne({ where: { email: email.getValue() } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### Client de API Externa (Exemplo: Discord)

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { ConfigService } from './Config.service';

export class DiscordClient {
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async connect(): Promise<void> {
    const token = this.configService.get('DISCORD_TOKEN');
    await this.client.login(token);
  }

  // Métodos para interagir com o Discord que serão usados pelos casos de uso
  async sendMessage(channelId: string, content: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await channel.send(content);
    }
  }

  // Outros métodos conforme necessário...
}
```

### Serviço de Infraestrutura (Exemplo: Email)

```typescript
import { NotificationService } from '../../../application/services/Notification.service';
import { Email } from '../../../../domain/value-objects/Email.value-object';

export class EmailNotificationService implements NotificationService {
  async sendWelcomeEmail(email: Email, name: string): Promise<void> {
    // Aqui você integraria com um serviço de email real (SendGrid, SES, etc.)
    // Por simplicidade, apenas logamos
    console.log(`Sending welcome email to ${email.getValue()} for ${name}`);
    // Em produção:
    // await this.emailProvider.send({ to: email.getValue(), subject: 'Welcome', body: `Hello ${name}!` });
  }
}
```

## Regras Importantes

1. **Implemente apenas as interfaces de domain**: Não crie novas interfaces aqui que não estejam definidas em domain (exceto para serviços de infrastructure que são específicos desta camada).
2. **Não vazamento de detalhes**: As implementações não devem expor detalhes específicos de bibliotecas (como TypeORM annotations) para as camadas superiores através de entidades ou DTOs compartilhados.
3. **Use mappers quando necessário**: Se houver imprecisão entre a entidade de domain e a entidade de persistência, use mappers para converter entre elas dentro desta camada.
4. **Configuração centralizada**: Mantenha configurações de infraestrutura (como strings de conexão, credenciais) em arquivos de configuração ou variáveis de ambiente, não hardcoded.
5. **Tratamento de erros de infrastructure**: Erros específicos de infrastructure (como falhas de conexão com banco de dados) devem ser capturados e, se necessário, convertidos em exceções de domínio ou application adequadas.
6. **Injeção de Dependência**: As implementações devem ser registradas no container de DI para serem resolvidas pelas camadas de domain e application através de suas interfaces.

## Como Esta Camada Interage com as Outras

- É utilizada pela camada de **application** através das interfaces de repositório e serviços definidas em domain ou application (via injeção de dependência).
- Pode ser utilizada diretamente pela camada de **presentation** para preocupações específicas de infrastructure (como enviar um arquivo para armazenamento), mas preferivelmente através de serviços definidos em application.
- Não deve importar nada de presentation (como controllers do Discord) para manter a separação de preocupações.
- Não deve ser importada por domain (isso violaria o princípio de inversão de dependência).

## Decisões de Tecnologia no Projeto

No projeto Nebula Surge Bot, as seguintes escolhas de infrastructure foram feitas:
- **Persistência**: Conexão com o banco de dados realizada via API com Axios (futuramente)
- **Cliente Discord**: discord.js
- **Outros serviços**: Utilizado a biblioteca DiscordX, Tsyringe e Typescript