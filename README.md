# Discord Bot - Clean Architecture

Bot para Discord desenvolvido com TypeScript e DiscordX, estruturado sob os princípios da Clean Architecture e preparado para execução em containers com Docker.

## Tecnologias

* TypeScript
* Discord.js
* DiscordX
* Docker e Docker Compose

## Arquitetura

O projeto é dividido em quatro camadas principais:

* `src/domain/`: Regras de negócio e entidades puras.
* `src/application/`: Casos de uso, interfaces e provedores de orquestração.
* `src/presentation/`: Comandos Slash, eventos, middlewares e helpers da interface do Discord.
* `src/infrastructure/`: Inicialização da aplicação (`App.ts`), variáveis de ambiente e serviços externos.

## Pré-requisitos

* Docker
* Docker Compose

## Como Executar

1. Configure as variáveis de ambiente criando o arquivo `.env` com base nas chaves do seu bot (ex: `DISCORD_TOKEN`).
2. Suba o ambiente via Docker Compose:

```bash
docker compose up -d
```

3. Para executar localmente fora do container:

```bash
npm install
npm run dev
```