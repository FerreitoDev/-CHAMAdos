# CHAMAdos — Frontend

Interface web do sistema de gerenciamento de chamados CHAMAdos.

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Linguagem |
| Vite | 8 | Build e dev server |
| Tailwind CSS | 4 | Estilização |
| shadcn/ui | 4 | Componentes base |
| Lucide React | — | Ícones |
| React Router | 8 | Roteamento |
| Vitest | 4 | Testes unitários |
| Testing Library | — | Testes de componentes |

## Pré-requisitos

- Node.js 22+
- Backend do CHAMAdos em execução (para integração completa)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar em modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Comandos

```bash
npm run dev           # servidor de desenvolvimento com HMR
npm run build         # build de produção
npm run preview       # prévia do build de produção
npm run lint          # ESLint
npm run format        # Prettier (apply)
npm run format:check  # Prettier (check only)
npm run test          # Vitest em watch mode
npm run test:run      # Vitest em modo single run
```

## Estrutura

```text
frontend/src/
├── app/
│   ├── layouts/         # Layouts de página (AppLayout)
│   ├── providers/       # Provedores globais (AppProviders)
│   └── router/          # Definição de rotas (React Router)
├── components/
│   └── ui/              # Componentes de interface reutilizáveis (shadcn/ui)
├── features/            # Features de negócio (organização por domínio)
├── shared/              # Utilitários e tipos compartilhados
├── lib/                 # Configurações de bibliotecas (cn utility)
├── index.css            # Design system: tokens CSS, dark mode, tipografia
├── main.tsx             # Entrypoint da aplicação
└── App.tsx              # Componente raiz
```

### Convenção de organização

O frontend segue **arquitetura feature-based**: cada funcionalidade de negócio
(ex: `tickets`, `auth`, `users`) vive em seu próprio diretório dentro de `features/`,
agrupando componentes, hooks, tipos e serviços relacionados.

Componentes verdadeiramente reutilizáveis entre features ficam em `components/`.

## Design System

A identidade visual do CHAMAdos está definida em `src/index.css` como CSS custom properties.

- **Tema:** Exclusivamente claro (Light Mode) com superfícies neutras em escala Zinc
- **Identidade visual:** Monocromática ancorada em escala tonal de laranja (`#EA580C` como ação primária)
- **Tipografia:** Inter Variable com suporte a números tabulares
- **Grid & Espaçamentos:** Base 8px para densidade corporativa balanceada
- **Componentes:** shadcn/ui adaptados à identidade do projeto

## Documentação

A documentação técnica detalhada do frontend está em [`../docs/frontend/`](../docs/frontend/).

- [`ROADMAP.md`](../docs/frontend/ROADMAP.md) — Roadmap de evolução visual e funcional do frontend
- [`decisions/`](../docs/frontend/decisions/) — Decisões arquiteturais (ADs)
- [`design/`](../docs/frontend/design/) — Design system, tokens e especificações visuais
