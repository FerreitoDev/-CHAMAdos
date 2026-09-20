# Planejamento Técnico — Fase 4 Frontend: Gestão e Consulta de Chamados (Tickets — Núcleo)

Este documento detalha as etapas de implementação do módulo de chamados (núcleo) no frontend do **CHAMAdos**. Cada etapa foi estruturada para ser anatomicamente coesa, testável e adequada para um commit independente, contendo obrigatoriamente a validação de testes ao final.

**Fundação disponível (Backend Fase 4 100% pronto):**
- `POST /tickets` — Criar novo chamado (`title`, `description`, `priority?`, `categoryId`)
- `GET /tickets` — Listar chamados com filtros e paginação (escopo RBAC aplicado por papel: `USER`, `TECHNICIAN`, `ADMIN`)
- `GET /tickets/:id` — Detalhes do chamado por ID com verificação de permissão
- Security Context pronto (`AuthProvider`, `useAuth`, `ProtectedRoute`, Axios client configurado)

---

## Estrutura da Feature

```text
src/features/tickets/
├── api/
│   ├── tickets.api.ts               # Requisições HTTP via Axios client
│   └── tickets.api.test.ts          # Testes unitários da integração HTTP
├── types/
│   └── tickets.types.ts             # Interfaces Ticket, CreateTicketPayload, GetTicketsParams, PaginatedTicketsResponse
├── components/
│   ├── TicketStatusBadge.tsx        # Badge visual para status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
│   ├── TicketStatusBadge.test.tsx   # Testes unitários do badge de status
│   ├── TicketPriorityBadge.tsx      # Badge visual para prioridade (LOW, MEDIUM, HIGH, URGENT)
│   ├── TicketPriorityBadge.test.tsx # Testes unitários do badge de prioridade
│   ├── TicketFilterBar.tsx          # Barra de filtros por status, prioridade, categoria e busca
│   ├── TicketFilterBar.test.tsx     # Testes da barra de filtros
│   ├── TicketTable.tsx              # Tabela de exibição dos chamados com paginação
│   ├── TicketTable.test.tsx         # Testes do componente da tabela
│   ├── CreateTicketModal.tsx        # Modal/Formulário de abertura de chamado
│   └── CreateTicketModal.test.tsx   # Testes de validação e submissão do formulário
├── pages/
│   ├── TicketsListPage.tsx          # Página principal de listagem e consulta
│   ├── TicketsListPage.test.tsx     # Testes de integração da listagem
│   ├── TicketDetailPage.tsx         # Página de detalhe e consulta de um chamado
│   └── TicketDetailPage.test.tsx    # Testes de integração da página de detalhe
```

---

## Etapas de Implementação

---

### Etapa 1 — Contrato da API e Tipos (`tickets.types.ts` e `tickets.api.ts`)

**Objetivo:** Definir os tipos do domínio de chamados no frontend e expor os métodos HTTP que consomem os endpoints do backend.

**Arquivos a criar:**
```text
src/features/tickets/
├── types/tickets.types.ts
├── api/tickets.api.ts
└── api/tickets.api.test.ts
```

**Tipos (`tickets.types.ts`):**
```typescript
import { Category } from '../../categories/types/categories.types';
import { UserRole } from '../../users/types/users.types';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  assigneeId: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  category: Category;
  requester: SafeUser;
  assignee: SafeUser | null;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: TicketPriority;
  categoryId: string;
}

export interface GetTicketsParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Métodos de API (`tickets.api.ts`):**
- `getTickets(params?: GetTicketsParams)` → `GET /tickets`
- `getTicketById(id: string)` → `GET /tickets/:id`
- `createTicket(payload: CreateTicketPayload)` → `POST /tickets`

**Checklist:**
- [x] Criar `src/features/tickets/types/tickets.types.ts`
- [x] Criar `src/features/tickets/api/tickets.api.ts` utilizando a instância Axios centralizada
- [x] Executar testes unitários da API (`npm run test tickets.api`) garantindo 100% dos testes verdes

---

### Etapa 2 — Componentes Visuais de Exibição (`TicketStatusBadge`, `TicketPriorityBadge` e `TicketTable`)

**Objetivo:** Criar componentes visuais reutilizáveis para exibir status, prioridades e a tabela de chamados.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── TicketStatusBadge.tsx
├── TicketStatusBadge.test.tsx
├── TicketPriorityBadge.tsx
├── TicketPriorityBadge.test.tsx
├── TicketTable.tsx
└── TicketTable.test.tsx
```

**Estilização e Recursos Visuais:**
- `TicketStatusBadge`:
  - `OPEN` → Badge Azul (Aberto / Aguardando atendimento)
  - `IN_PROGRESS` → Badge Amarelo/Laranja (Em atendimento)
  - `RESOLVED` → Badge Verde (Resolvido)
  - `CLOSED` → Badge Cinza (Encerrado)
- `TicketPriorityBadge`:
  - `LOW` → Badge Verde/Verde claro (Baixa)
  - `MEDIUM` → Badge Azul (Média)
  - `HIGH` → Badge Laranja (Alta)
  - `URGENT` → Badge Vermelho/Destaque (Urgente)
- `TicketTable`:
  - Colunas: ID, Título, Solicitante, Responsável, Categoria, Prioridade, Status, Criado em, Ações (Botão Detalhes).
  - Estado vazio (*Empty State*) quando a lista de chamados estiver vazia.

**Checklist:**
- [x] Criar `TicketStatusBadge.tsx` e `TicketPriorityBadge.tsx`
- [x] Criar `TicketTable.tsx` com link/ação para a página de detalhes
- [x] Executar testes unitários dos componentes visuais (`npm run test TicketTable TicketStatusBadge`) garantindo 100% verdes

---

### Etapa 3 — Componente de Filtros (`TicketFilterBar`)

**Objetivo:** Prover uma barra de filtros reutilizável para a página de listagem de chamados.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── TicketFilterBar.tsx
└── TicketFilterBar.test.tsx
```

**Funcionalidades da Barra de Filtros:**
- Campo de busca por texto (filtra `title` ou `description`).
- Select de Status (`Todos`, `Aberto`, `Em atendimento`, `Resolvido`, `Encerrado`).
- Select de Prioridade (`Todas`, `Baixa`, `Média`, `Alta`, `Urgente`).
- Select de Categoria (carrega dinamicamente categorias ativas via `getCategories`).
- Botão "Limpar Filtros".

**Checklist:**
- [x] Criar `TicketFilterBar.tsx`
- [x] Implementar carregamento dinâmico de categorias ativas no filtro
- [x] Executar testes unitários do filtro (`npm run test TicketFilterBar`) garantindo 100% verdes

---

### Etapa 4 — Modal de Abertura de Chamado (`CreateTicketModal`)

**Objetivo:** Criar modal/formulário para qualquer usuário abrir um chamado informando título, descrição, prioridade e categoria.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── CreateTicketModal.tsx
└── CreateTicketModal.test.tsx
```

**Regras de Formulário:**
- Campo `title`: Obrigatório (mínimo 3 caracteres).
- Campo `description`: Obrigatório (mínimo 5 caracteres).
- Select `categoryId`: Obrigatório (seleção de categoria ativa).
- Select `priority`: Opcional (padrão: `MEDIUM`).
- Submissão realiza chamada a `createTicket(payload)` e dispara callback `onSuccess` para recarregar a lista.

**Checklist:**
- [x] Criar `CreateTicketModal.tsx` com validação de campos obrigatórios
- [x] Tratar mensagens de erro amigáveis caso a API retorne falha
- [x] Executar testes unitários do formulário (`npm run test CreateTicketModal`) garantindo 100% verdes

---

### Etapa 5 — Páginas da Feature, Roteamento e Testes de Integração (`TicketsListPage`, `TicketDetailPage` e Router)

**Objetivo:** Criar as telas principais de chamados, integrar estado de busca/paginação, proteger as rotas no React Router e cobrir com testes de integração.

**Arquivos a criar/modificar:**
```text
src/features/tickets/pages/
├── TicketsListPage.tsx
├── TicketsListPage.test.tsx
├── TicketDetailPage.tsx
└── TicketDetailPage.test.tsx
src/app/router.tsx
```

**Telas e Comportamentos:**
- **`TicketsListPage`**:
  - Exibe título, botão "Abrir Chamado" (abre `CreateTicketModal`).
  - Renderiza `TicketFilterBar` e `TicketTable` com controle de paginação.
  - Atualiza busca reativamente conforme filtros e páginas mudam.
- **`TicketDetailPage`**:
  - Exibe informações completas do chamado (ID, título, descrição detalhada, badges de status e prioridade).
  - Exibe card com dados do Solicitante (nome, email), Responsável (ou "Sem responsável atribuído"), Categoria e Datas (`createdAt`, `resolvedAt`, `closedAt`).
  - Botão "Voltar para Lista".
- **Roteamento (`router.tsx`)**:
  - Rota `/tickets` (protegida para qualquer usuário autenticado).
  - Rota `/tickets/:id` (protegida para qualquer usuário autenticado).

**Checklist:**
- [x] Criar `TicketsListPage.tsx` e `TicketDetailPage.tsx`
- [x] Registrar rotas `/tickets` e `/tickets/:id` em `src/app/router/index.tsx`
- [x] Executar testes de integração das telas e roteamento (`npm run test TicketsListPage TicketDetailPage`) garantindo 100% verdes

---

## Ordem de Execução Recomendada

```
Etapa 1 (API & Types + Tests) → Etapa 2 (Badges & Table + Tests) → Etapa 3 (FilterBar + Tests) → Etapa 4 (CreateTicketModal + Tests) → Etapa 5 (Pages & Router + Tests)
```

---

## Critérios de Conclusão da Fase 4 (Frontend)

- [x] Usuário comum, técnico ou admin consegue abrir chamados via modal com título, descrição, categoria e prioridade.
- [x] Usuário comum visualiza apenas seus próprios chamados na listagem e na tela de detalhe.
- [x] Técnico visualiza chamados sem responsável, seus atribuídos e solicitados.
- [x] Admin visualiza todos os chamados do sistema.
- [x] Filtros por status, prioridade, categoria e busca textual funcionam integrados à paginação.
- [x] Página de detalhes `/tickets/:id` exibe todas as informações do chamado e seus metadados.
- [x] Roteamento protegido impede acesso de usuários não autenticados.
- [x] Todos os testes da suíte do frontend executando 100% verdes.
