# 🔥 CHAMAdos

Sistema de gerenciamento de chamados desenvolvido como projeto de portfólio.

O objetivo é construir uma aplicação completa para gerenciamento de suporte técnico, permitindo que usuários abram chamados, técnicos realizem o atendimento e administradores gerenciem a distribuição, resolução e encerramento dos chamados.

## Status

🚧 Em desenvolvimento — fundação configurada, implementação das funcionalidades em andamento.

## Repositório

```text
CHAMAdos/
├── backend/        # API REST (NestJS + Prisma + PostgreSQL)
├── frontend/       # Interface web (React + Vite + Tailwind)
├── docs/           # Documentação técnica e de domínio
└── docker-compose.yml
```

## Stack

### Backend

- NestJS 11
- TypeScript 5
- Prisma 7
- PostgreSQL
- Docker

→ Veja [`backend/README.md`](backend/README.md) para setup e comandos.

### Frontend

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- shadcn/ui

→ Veja [`frontend/README.md`](frontend/README.md) para setup e comandos.

## Início rápido

### 1. Subir infraestrutura

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades planejadas

- Autenticação e autorização por papéis (USER, TECHNICIAN, ADMIN)
- Abertura e gerenciamento de chamados
- Categorias de chamados
- Atribuição e reatribuição de chamados a técnicos
- Comentários por chamado
- Notificações internas
- Auditoria de ações
- Gerenciamento de usuários
- Relatórios administrativos

## Documentação

A documentação está organizada por contexto:

| Diretório | Conteúdo |
|---|---|
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Roadmap de desenvolvimento, fases, dependências e definição de MVP |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitetura de domínio, regras de negócio, ciclo de vida dos chamados |
| [`docs/idea.md`](docs/idea.md) | Visão original e princípios do projeto |
| [`docs/backend/`](docs/backend/) | Decisões arquiteturais do backend |
| [`docs/frontend/`](docs/frontend/) | Decisões arquiteturais e design system do frontend |