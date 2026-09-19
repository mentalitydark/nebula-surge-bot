# Fluxo de Trabalho Git e Versionamento no Projeto Nebula Surge Bot

Este documento detalha o fluxo de trabalho Git adotado no projeto Nebula Surge Bot, incluindo convenções de branches, mensagens de commit, processo de pull request e práticas de versionamento.

## 1. Convenções de Branches

O projeto segue um modelo de branching baseado em feature branches com identificação clara de issues.

### Padrão de Nomenclatura
- **Feature branches:** `feat/<issue-id>-<descricao-curta>`
- **Bug fix branches:** `fix/<issue-id>-<descricao-curta>`
- **Documentation branches:** `docs/<issue-id>-<descricao-curta>` (quando aplicável)
- **Refactor branches:** `refactor/<issue-id>-<descricao-curta>`
- **Test branches:** `test/<issue-id>-<descricao-curta>`
- **Chore branches:** `chore/<issue-id>-<descricao-curta>`

### Exemplos
- `feat/83-criacao-documentacao-completa`
- `fix/75-configuracao-eslint`
- `docs/80-atualizacao-readme`
- `refactor/90-melhoria-servico-autenticacao`

### Branches Principais
- `main` ou `master`: Branch de produção estável (se aplicável)
- `develop`: Branch de integração onde o desenvolvimento ocorre
- Outras branches temporárias são criadas a partir de `develop` e mescladas de volta nele

## 2. Convenções de Commits (Conventional Commits)

Todos os commits devem seguir a especificação de [Conventional Commits](https://www.conventionalcommits.org/).

### Estrutura do Commit
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Permitidos
- **feat:** Nova funcionalidade para o usuário
- **fix:** Correção de bug
- **docs:** Alterações apenas na documentação
- **style:** Alterações de formatação, espaçamento, etc. (não afetam o significado do código)
- **refactor:** Alteração de código que não corrige um bug nem adiciona uma funcionalidade
- **perf:** Alteração que melhora o desempenho
- **test:** Adição ou correção de testes
- **build:** Alterações que afetam o sistema de build ou dependências externas
- **ci:** Alterações nos arquivos de configuração de CI
- **chore:** Outras alterações que não modificam arquivos de fonte ou de teste (ex: atualização de ferramentas)

### Exemplos de Commits Válidos
- `feat: adiciona sistema de autenticação de usuários`
- `fix(correcao-bug): resolve problema de conexão com banco de dados`
- `docs: atualiza README com instruções de instalação`
- `style: ajusta indentação no arquivo user.service.ts`
- `refactor: extrai lógica de validação para serviço separado`
- `test: adiciona testes unitários para o caso de uso de criação de usuário`
- `chore: atualiza dependência do typescript para versão 5.0`

### Regras Importantes
1. O tipo deve estar em letras minúsculas
2. Após o tipo, pode vir um escopo entre parênteses (opcional)
3. Depois dos dois pontos, deve haver um espaço seguido da descrição
4. A descrição deve ser curta, em imperativo e não terminar com ponto
5. O corpo do commit é opcional e deve ser usado para explicar o "porquê" das alterações
6. O rodapé é opcional e usado para referenciar issues ou indicar mudanças que quebram compatibilidade (BREAKING CHANGE)

## 3. Processo de Pull Request (PR)

### Antes de Abrir um PR
1. Certifique-se de que sua branch está atualizada com `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout sua-branch
   git merge develop
   ```
2. Execute os testes locais:
   ```bash
   npm test
   ```
3. Verifique se não há erros de lint:
   ```bash
   npm run lint
   ```
4. Assegure-se de que o TypeScript compila sem erros:
   ```bash
   npx tsc --noEmit
   ```
5. Certifique-se de que suas alterações estão divididas em commits lógicos (use `git rebase -i` se necessário)

### Abrir um PR
1. Faça push da sua branch para o repositório remoto:
   ```bash
   git push origin sua-branch
   ```
2. Abra um Pull Request branch para `develop`
3. Preencha o template de PR com:
   - Descrição clara das alterações
   - Referência à issue relacionada (ex: `Closes #83`)
   - Checklist de tarefas concluídas
   - Evidências de teste (se aplicável)
4. Solicite revisão para pelo menos um membro da equipe

### Durante a Revisão
1. Responda prontamente aos comentários dos revisores
2. Faça alterações necessárias através de novos commits na mesma branch
3. Não faça `force push` após o PR ter sido aprovado (exceto em casos específicos acordados com a equipe)
4. Mantenha o PR focado na issue original

### Após Aprovação
1. Um mantenedor fará o merge do PR para `develop` usando:
   - **Merge commit** (para preservar histórico detalhado) ou
   - **Squash and merge** (para manter histórico limpo em branches de feature)
2. A branch pode ser deletada após o merge (se for temporária)

## 4. Código de Conduta para Commits e PRs

### Boas Práticas
- Commits devem ser atômicos e focados em uma única alteração lógica
- Mensagens de commit devem ser claras e descritivas em português brasileiro
- PRs devem estar relacionados a uma única issue ou funcionalidade
- Evite commits grandes que alterem muitas coisas não relacionadas
- Sempre inclua testes para novas funcionalidades e correções de bug
- Documentação deve acompanhar alterações de funcionalidade quando relevante

### Proibido
- Commits com mensagens genéricas como "fix", "update", "wip"
- Commits que contenham código comentado ou debug deixado para trás
- Alterações que quebrem intencionalmente o build ou os testes sem plano de recuperação
- Merge direto para branches principais sem passar por PR (exceto em emergências críticas)

## 5. Versionamento e Releases

### Estratégia de Versionamento
O projeto segue o [Versionamento Semântico 2.0.0](https://semver.org/lang/pt-BR/):
- Dado um número de versão MAJOR.MINOR.PATCH:
  - **MAJOR** aumenta quando houver mudanças incompatíveis na API
  - **MINOR** aumenta quando houver adição de funcionalidade de forma retrocompatível
  - **PATCH** aumenta quando houver correções de bugs retrocompatíveis

### Processo de Release
1. Quando `develop` estiver estável e pronto para release:
   - Crie uma branch de release: `release/vMAJOR.MINOR.PATCH`
   - Atualize o arquivo `package.json` com a nova versão
   - Atualize o `CHANGELOG.md` com as mudanças desde a última release
   - Abra um PR para `main` (ou `master`)
2. Após aprovação e merge:
   - Tagge o commit com a versão: `git tag vMAJOR.MINOR.PATCH`
   - Faça push da tag: `git push origin vMAJOR.MINOR.PATCH`
   - O processo de CI/CD deve automaticamente publicar a release
3. Mescle a branch de release de volta para `develop` para não perder alterações

### Hotfixes
Para correções urgentes em produção:
1. Crie uma branch a partir da tag de produção: `hotfix/descricao-curta`
2. Faça as alterações necessárias
3. Siga o mesmo processo de PR, mas targetando `main` (ou `master`)
4. Após merge em `main`, mescle também para `develop` para incluir a correção no próximo release

## 6. Ferramentas e Configurações

### Git Hooks (se aplicável)
Considere usar ferramentas como `husky` e `lint-staged` para automatizar verificações antes de commits.

### Templates de Commit
O projeto pode se beneficiar de um template de commit padrão para garantir consistência.

### Integração com GitHub
- Use labels no GitHub para categorizar issues e PRs (ex: `bug`, `feature`, `documentation`)
- Vincule PRs às issues usando palavras-chave como `Closes`, `Fixes`, `Addresses`
- Habilite checks de CI obrigatórios antes de permitir merge

## 7. Exemplo de Fluxo Completo

### Trabalhando na Issue #83: Criação da Documentação Completa
```bash
# 1. Atualizar branch develop
git checkout develop
git pull origin develop

# 2. Criar branch para a issue
git checkout -b feat/83-criacao-documentacao-completa

# 3. Fazer alterações (criar pasta docs e documentos)
mkdir -p docs
# ... criar os arquivos de documentação ...

# 4. Preparar commit
git add docs/
git commit -m "docs: cria documentação completa do projeto
- Adiciona pasta docs/ na raiz
- Cria arquivos architecture.md, domain.md, application.md, infrastructure.md, presentation.md, solid-principles.md e git-workflow.md
- Todos os documentos em português brasileiro explicando Clean Architecture, SOLID, fluxo Git e camadas do projeto"

# 5. Testar localmente (não há código, mas verificar se documentos estão corretos)
ls -la docs/
git status

# 6. Atualizar com develop (se necessário)
git fetch origin
git rebase origin/develop

# 7. Push para repositório remoto
git push origin feat/83-criacao-documentacao-completa

# 8. Abrir PR no GitHub para branch develop
# Preencher template, solicitar review, aguardar aprovação

# 9. Após merge, branch pode ser deletada
git checkout develop
git branch -d feat/83-criacao-documentacao-completa
```

## 8. Considerações Finais

Este fluxo de trabalho busca equilibrar:
- **Segurança:** Garantir que apenas código testado e revisado vá para branches principais
- **Clareza:** Manter histórico limpo e compreensível através de convenções padronizadas
- **Eficiência:** Permitir desenvolvimento paralelo sem conflitos excessivos
- **Rastreabilidade:** Facilitar a conexão entre código, issues e documentação

A aderência consistente a estas práticas resulta em:
- Menos bugs em produção
- Melhor colaboração em equipe
- Histórico de projeto mais útil para auditorias e aprendizagem
- Processo de release mais previsível e menos estressante

Lembre-se: o objetivo do fluxo de trabalho é servir ao time e ao produto, não o contrário. Adapte estas diretrizes conforme necessário para melhor atender às necessidades específicas do projeto Nebula Surge Bot, mantendo sempre os princípios de transparência, qualidade e colaboração.