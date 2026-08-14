# CHAMAdos — Backend

API REST do sistema de gerenciamento de chamados CHAMAdos.

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| NestJS | 11 | Framework HTTP |
| TypeScript | 5 | Linguagem |
| Prisma | 7 | ORM / migrations |
| PostgreSQL | — | Banco de dados |
| Docker | — | Infraestrutura local |

## Pré-requisitos

- Node.js 22+
- Docker e Docker Compose

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha as variáveis no `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chamados"
PORT=3000
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Executar as migrations

```bash
npx prisma migrate dev
```

### 5. Iniciar em modo de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

## Comandos

### Desenvolvimento

```bash
npm run start:dev     # watch mode
npm run start         # sem watch
npm run start:prod    # produção (requer build)
```

### Build

```bash
npm run build
```

### Testes

```bash
npm run test          # unitários
npm run test:watch    # unitários em watch
npm run test:cov      # unitários com cobertura
npm run test:e2e      # end-to-end
```

### Lint e formatação

```bash
npm run lint
npm run format
```

### Prisma

```bash
npx prisma generate           # regenerar Prisma Client
npx prisma migrate dev        # criar e aplicar nova migration
npx prisma migrate dev --name <nome>
npx prisma studio             # painel visual do banco
```

### Docker

```bash
docker compose up -d     # iniciar serviços em background
docker compose down      # parar serviços
docker compose ps        # listar containers
docker compose logs      # ver logs
```

## Estrutura

```text
backend/
├── prisma/
│   ├── schema.prisma        # Schema do banco (modelos e enums)
│   └── migrations/          # Histórico de migrations
├── src/
│   ├── main.ts              # Bootstrap da aplicação
│   ├── app.module.ts        # Módulo raiz
│   ├── prisma/              # PrismaModule e PrismaService (global)
│   └── users/               # Domínio de usuários (scaffold inicial)
├── test/                    # Testes e2e
├── .env.example             # Template de variáveis de ambiente
└── package.json
```

## Modelos do banco

O schema Prisma define os seguintes modelos:

| Modelo | Descrição |
|---|---|
| `User` | Usuário do sistema (USER, TECHNICIAN, ADMIN) |
| `Category` | Categoria de chamado |
| `Ticket` | Chamado de suporte |
| `Comment` | Comentário em um chamado |
| `Audit` | Registro de auditoria de ações |
| `Notification` | Notificação interna para usuários |
| `SystemSettings` | Configurações administrativas do sistema |

## Documentação

A documentação técnica detalhada do backend está em [`../docs/backend/`](../docs/backend/).

- [`decisions/`](../docs/backend/decisions/) — Decisões arquiteturais (ADs)
- [`COMMANDS.md`](../docs/backend/COMMANDS.md) — Referência rápida de comandos

A arquitetura de domínio e regras de negócio estão em [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
