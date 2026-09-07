# Camada de Domain

A camada de domain é o coração da aplicação, contendo as regras de negócio puras e independentes de qualquer tecnologia ou framework externo.

## Responsabilidades

- **Entidades**: Objetos com identidade e comportamento que representam conceitos do domínio.
- **Value Objects**: Objetos imutáveis que descrevem características ou atributos sem identidade conceitual.
- **Erros de Domínio**: Exceções específicas que representam violações de regras de negócio.
- **Interfaces de Repositórios**: Contratos que definem como os casos de uso irão persistir e recuperar entidades, sem detalhes de implementação.

## Características

- **Zero dependências externas**: Não importa nada de `infrastructure`, `presentation` ou frameworks externos (como bibliotecas de banco de dados, frameworks web, etc.).
- **Independência de tecnologia**: As regras de negócio não devem saber se a aplicação está usando um banco de dados SQL, NoSQL, ou se está sendo acessada via REST, GraphQL, ou qualquer outra interface.
- **Testabilidade**: Pode ser testada isoladamente, sem necessidade de mocks de infraestrutura ou bancos de dados.

## Exemplo de Estrutura

```
domain/
├── entities/
│   └── User.entity.ts
├── value-objects/
│   └── Email.value-object.ts
├── errors/
│   └── DomainError.ts
└── repositories/
    └── UserRepository.ts
```

### Entidade (Exemplo)

```typescript
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  public static create(id: string, email: Email, name: string): User {
    // Validações de negócio aqui
    return new User(id, email, name, new Date());
  }
}
```

### Value Object (Exemplo)

```typescript
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    // Validação do formato de e-mail
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase().trim();
  }

  public static create(email: string): Email {
    return new Email(email);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

### Interface de Repositório (Exemplo)

```typescript
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  delete(id: string): Promise<void>;
}
```

## Regras Importantes

1. **Nenhuma dependência de frameworks**: Não importe bibliotecas como TypeORM, Prisma, Express, etc.
2. **Nenhuma preocupação com persistência**: Não inclua annotations de ORM ou detalhes de como os dados são armazenados.
3. **Regra de negócio primeiro**: Toda lógica de validação e transformação de dados deve estar aqui.
4. **Imutabilidade sempre que possível**: Preferir value objects imutáveis e entidades com comportamento controlado.

## Como Esta Camada Interage com as Outras

- A camada de **application** usa as entidades e interfaces de repositório definidas aqui para criar casos de uso.
- A camada de **infrastructure** implementa as interfaces de repositório (por exemplo, usando TypeORM para salvar usuários em um banco de dados).
- A camada de **presentation** nunca deve acessar diretamente esta camada; ela deve passar pelos casos de uso da camada de application.