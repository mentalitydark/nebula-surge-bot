# Visão Geral da Arquitetura Limpa (Clean Architecture) no Projeto Nebula Surge Bot

Este documento explica a aplicação dos princípios da Clean Architecture no projeto Nebula Surge Bot, um bot de Discord desenvolvido em Node.js com TypeScript.

## Estrutura de Camadas

A organização do código segue estritamente a separação de responsabilidades em camadas, conforme descrito abaixo:

```
src/
├── domain/            # Entidades, Value Objects, Erros de domínio e Interfaces de repositórios (Zero dependências externas)
├── application/       # Casos de uso (Use Cases), DTOs e Services
├── infrastructure/    # Implementações de banco (TypeORM/Prisma), clients de APIs, Adapters
└── presentation/      # Controllers, Handlers, Middlewares, Guards, CLI/Bot Commands
```

### Camada de Domain
- Contém entidades, value objects e regras de negócio puras.
- **Zero dependências externas**: Não importa nada de infrastructure, presentation ou frameworks externos.
- Define as interfaces de repositórios que serão implementadas na camada de infrastructure.

### Camada de Application
- Contém casos de uso (Use Cases) que orquestram o fluxo de dados entre entidades e repositórios.
- Define DTOs (Data Transfer Objects) para entrada e saída dos casos de uso.
- Contém serviços de aplicação que não são específicos de nenhum framework.
- Depende apenas da camada de domain (através de interfaces).

### Camada de Infrastructure
- Contém implementações concretas das interfaces definidas na camada de domain.
- Inclui ORMs (TypeORM/Prisma), clients de APIs de terceiros, drivers de banco de dados e outros adapters.
- É responsável pela comunicação com o mundo exterior (bancos de dados, APIs externas, sistemas de arquivos, etc.).
- Implementa as interfaces de repositório definidas em domain.

### Camada de Presentation/Adapters
- Contém controllers, handlers, middlewares, guards e comandos do bot (CLI/Bot Commands).
- Responsável por receber entradas do sistema externo (como comandos do Discord) e traduzir para casos de uso.
- Apresenta a saída dos casos de uso ao usuário de forma adequada (respostas do Discord, logs, etc.).
- Pode incluir DTOs específicos para comunicação com frameworks externos (como bibliotecas do Discord).

## Regras de Ouro da Clean Architecture Aplicadas

1. **Isolamento do Domínio**: A camada `domain` nunca importa nada de `infrastructure`, `presentation` ou frameworks externos.
2. **Inversão de Dependência**: A camada `application` interage com banco e serviços externos exclusivamente por meio de interfaces/contratos definidos em domain.
3. **Injeção de Dependência**: Utilizamos containers de DI (como `tsyringe`) para resolver instâncias nos pontos de entrada, garantindo que as dependências sejam invertidas.

## Benefícios dessa Arquitetura

- **Testabilidade**: A camada de domain pode ser testada isoladamente sem dependências externas.
- **Flexibilidade**: É possível trocar implementações de infrastructure (por exemplo, mudar de TypeORM para Prisma) sem afetar as regras de negócio.
- **Manutenibilidade**: A separação clara de responsabilidades facilita a localização e modificação de códigos relacionados a específicas preocupações.
- **Independência de Frameworks**: O núcleo do negócio não está preso a nenhum framework ou biblioteca específica.

## Como Navegar neste Documento

- [Detalhamento da Camada Domain](./domain.md)
- [Detalhamento da Camada Application](./application.md)
- [Detalhamento da Camada Infrastructure](./infrastructure.md)
- [Detalhamento da Camada Presentation](./presentation.md)
- [Princípios SOLID Aplicados](./solid-principles.md)
- [Fluxo de Trabalho Git e Versionamento](./git-workflow.md)