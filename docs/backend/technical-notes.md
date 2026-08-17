# Notas Técnicas — Backend

## Vulnerabilidade transitiva no Prisma

**Data:** 2026-08-17

Durante a instalação das dependências de autenticação, o `npm audit` identificou 3 vulnerabilidades de alta severidade relacionadas ao pacote `deepmerge-ts`.

### Origem

A dependência vulnerável é transitiva:

`prisma` → `@prisma/config` → `deepmerge-ts`

### Situação

A correção automática disponibilizada pelo npm exige:

```bash
npm audit fix --force
```

Porém, essa operação faria uma alteração de versão do Prisma para 6.12.0, caracterizada pelo npm como uma mudança potencialmente incompatível.

### Decisão

Não executar ```npm audit fix --force``` neste momento.

A vulnerabilidade será reavaliada posteriormente quando houver uma atualização compatível do Prisma que permita corrigir o problema sem introduzir uma alteração potencialmente incompatível.

### Comando utilizado

```bash
npm audit
```

**Não precisa criar AD para isso.** É justamente o tipo de coisa que uma nota técnica registra sem transformar cada ocorrência em uma decisão arquitetural.