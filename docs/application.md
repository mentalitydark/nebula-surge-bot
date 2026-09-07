# Camada de Application

A camada de application contém os casos de uso (use cases) que orquestram as operações do sistema, aplicando as regras de negócio definidas na camada de domain. Esta camada é responsável por definir o que o sistema deve fazer, sem detalhes de como isso é feito (que fica para a infrastructure) ou como é apresentado (que fica para a presentation).

## Responsabilidades

- **Casos de Uso (Use Cases)**: Implementam operações específicas de negócio que atendem aos requisitos funcionais.
- **DTOs (Data Transfer Objects)**: Estruturas de dados usadas para transferir informação entre camadas, especialmente entre presentation e application.
- **Serviços de Application**: Lógica de aplicação que não é específica de nenhum caso de uso, mas que não pertence ao domain (por exemplo, serviços de notificação, processamento de arquivos, etc.).

## Características

- **Depende apenas da camada de domain**: Importa entidades, value objects e interfaces de repositórios definidas em domain.
- **Não conhece detalhes de infraestrutura**: Não importa nada de infrastructure (como TypeORM, Prisma, clientes de API externos).
- **Não conhece detalhes de presentation**: Não importa frameworks web, bibliotecas do Discord, ou qualquer coisa específica de como o sistema é acessado.
- **Orquestração, não implementação de regras de negócio**: Os casos de uso coordenam chamadas para entidades e repositórios, mas as regras de negócio puras permanecem no domain.
- **Testabilidade**: Pode ser testada com mocks das interfaces de repositório, sem necessidade de infraestrutura real.

## Exemplo de Estrutura

```
application/
├── use-cases/
│   ├── user/
│   │   ├── CreateUser.use-case.ts
│   │   └── GetUserById.use-case.ts
│   └── guild/
│       └── JoinGuild.use-case.ts
├── dtos/
│   ├── user/
│   │   ├── CreateUser.dto.ts
│   │   └── GetUserById.dto.ts
│   └── guild/
│       └── JoinGuild.dto.ts
└── services/
    └── NotificationService.ts
```

### Caso de Uso (Exemplo)

```typescript
import { UserRepository } from '../../domain/repositories/User.repository';
import { Email } from '../../domain/value-objects/Email.value-object';
import { User } from '../../domain/entities/User.entity';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserDto): Promise<User> {
    // Validações de application (se necessário)
    const email = Email.create(input.email);
    
    // Verifica se o email já existe (regra de negócio que pode estar aqui ou no domain)
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Cria a entidade de domínio (regras de negócio puras estão no domain)
    const user = User.create(
      crypto.randomUUID(), 
      email, 
      input.name
    );
    
    // Persiste através do repositório (interface de domain)
    await this.userRepository.save(user);
    
    return user;
  }
}
```

### DTO (Exemplo)

```typescript
export class CreateUserDto {
  public readonly email: string;
  public readonly name: string;

  constructor(email: string, name: string) {
    this.email = email;
    this.name = name;
  }
}
```

### Serviço de Application (Exemplo)

```typescript
export interface NotificationService {
  sendWelcomeEmail(email: Email, name: string): Promise<void>;
}

export class EmailNotificationService implements NotificationService {
  async sendWelcomeEmail(email: Email, name: string): Promise<void> {
    // Implementação que poderia usar um serviço de email externo
    // Mas a interface fica aqui para que o domain não saiba de email
    console.log(`Sending welcome email to ${email.getValue()} for ${name}`);
  }
}
```

## Regras Importantes

1. **Depende apenas de domain**: Nunca importe diretamente de infrastructure ou presentation.
2. **Use interfaces para dependências externas**: Se precisar de algo de infrastructure (como enviar email), defina uma interface aqui e implemente-a na infrastructure.
3. **DTOs para fronteiras**: Use DTOs para entrada e saída dos casos de uso, evitando expor entidades de domain diretamente.
4. **Transacionalidade**: Se um caso de uso envolver múltiplas operações que devem ser atômicas, considere gerenciar transações aqui (mas a implementação específica fica na infrastructure).
5. **Tratamento de erros de application**: Erros que são específicos das regras de application (como validações de entrada) podem ser lançados aqui.

## Como Esta Camada Interage com as Outras

- Recebe comandos da camada de **presentation** (através de controllers/handlers) na forma de DTOs.
- Usa as entidades e interfaces de repositório da camada de **domain** para executar operações de negócio.
- Pode depender de interfaces definidas aqui que são implementadas na camada de **infrastructure** (como serviços de email, armazenamento de arquivos, etc.).
- Não deve saber nada sobre como os dados são realmente armazenados (isso é infrastructure) ou como são apresentados ao usuário (isso é presentation).