# Guia de Clean Architecture

Guia de referência para a Clean Architecture do projeto, focado na Regra de Dependência: o código de uma camada interna jamais deve importar ou depender de uma camada externa.

```text
[ Infrastructure / Presentation ]  -->  [ Application ]  -->  [ Domain ]
        (Mundo Externo)                     (Fluxos)          (Regras Puras)

```

---

## 1. Responsabilidade das Camadas

### `domain/` (Domínio)

* **O que é:** Regras de negócio puras que existem independentemente de framework, banco de dados ou interface.
* **O que entra:** Entidades, Value Objects, Erros de Domínio e Serviços de Domínio.
* **Regra:** **NUNCA** importe bibliotecas externas (como `discord.js`, `typeorm`, `express`) nesta pasta.

### `application/` (Aplicação)

* **O que é:** Orquestração dos fluxos de execução do sistema.
* **O que entra:**
* `use-cases/`: Ações do sistema (`LoadCommandsUseCase.ts`, `RegisterCommandsUseCase.ts`).
* `contracts/`: Interfaces de orquestração (`UseCaseInterface.ts`).
* `providers/`: Contratos de serviços de suporte (`LoggerProviderInterface.ts`).
* `repositories/`: Contratos de acesso a dados (`UserRepositoryInterface.ts`).



### `presentation/` (Apresentação / Interface)

* **O que é:** Porta de entrada do usuário. Traduz dados externos para os Casos de Uso e formata as respostas.
* **O que entra:**
* `commands/`: Comandos Slash (`Strike.ts`).
* `events/`: Eventos do Discord (`AutoBan.ts`).
* `middlewares/`: Interceptadores de execução (ex: validação de permissões).
* `constants/`: Constantes relacionadas à apresentações do sistema.



### `infrastructure/` (Infraestrutura)

* **O que é:** Ferramentas concretas, drivers e serviços de terceiros.
* **O que entra:**
* `config/`: Configurações que envolvem o Discord (canais, cargos).
* `providers/`: Implementações concretas das interfaces da aplicação (`ConsoleLoggerProvider.ts`).
* `env/`: Leitura e parsing de ambiente.



---

## 2. Perguntas de Diagnóstico

Para decidir em qual pasta criar um arquivo:

| Camada | Pergunta de Diagnóstico |
| --- | --- |
| **`domain/`** | *"Se o Discord, a Web e o Banco sumirem, esse conceito ainda existe no negócio?"* |
| **`application/`** | *"Este arquivo orquestra uma ação do sistema ou define um contrato de suporte?"* |
| **`presentation/`** | *"Este arquivo serve para capturar a interação do usuário ou formatar a resposta no Discord?"* |
| **`infrastructure/`** | *"Este arquivo é uma ferramenta concreta, biblioteca externa ou acesso a banco de dados?"* |

---

## 3. Dicionário de Termos

* **Services:** Lógicas operacionais que não pertencem a uma única entidade.
* **Schemas:** Estruturas de validação de dados (Zod, Joi) ou mapeamentos de tabelas (ORM).
* **Providers:** Implementações de bibliotecas de terceiros (logs, e-mails, criptografia).
* **Middlewares:** Funções de interceptação executadas antes dos comandos/controllers.
* **Helpers:** Funções puras utilitárias para evitar código repetitivo na interface.

---

## 4. Estrutura Final do Projeto

```text
└── src
    ├── application
    │   ├── container
    │   ├── contracts
    │   ├── providers
    │   └── use-cases
    ├── domain
    │   └── errors
    ├── infrastructure
    │   ├── config
    │   ├── container
    │   ├── env
    │   └── providers
    └── presentation
        ├── commands
        ├── constants
        ├── events
        └── middlewares
```

---