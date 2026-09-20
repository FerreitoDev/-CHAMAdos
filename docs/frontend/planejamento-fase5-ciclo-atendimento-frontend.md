# Planejamento Técnico — Fase 5 Frontend: Ciclo de Atendimento de Chamados

Este documento detalha as etapas de implementação do ciclo de atendimento e transição de estados dos chamados no frontend do **CHAMAdos**. Cada etapa é modular, testável e possui validação com testes unitários ao final de sua execução.

**Fundação disponível (Backend Fase 5 100% pronto):**
- `PATCH /tickets/:id/assign` — Técnico assume ou ADMIN atribui chamado
- `PATCH /tickets/:id/reassign` — ADMIN altera o técnico responsável
- `PATCH /tickets/:id/resolve` — Técnico responsável ou ADMIN marca chamado como `RESOLVED`
- `PATCH /tickets/:id/close` — ADMIN encerra chamado `RESOLVED` alterando para `CLOSED`
- `PATCH /tickets/:id/reopen` — Solicitante (`USER`) ou ADMIN reabre chamado `RESOLVED`/`CLOSED` para `OPEN`
- Segurança e RBAC integrados (`useAuth()`, papéis `USER`, `TECHNICIAN`, `ADMIN`)

---

## Regras de Interface e Comportamento por Papel

### 1. Visibilidade e Habilitação de Ações

| Ação | Condição de Estado | Papel Autorizado | Comportamento na UI |
|---|---|---|---|
| **Assumir Chamado** | `OPEN` (sem técnico) | `TECHNICIAN` | Botão direto com confirmação imediata (autoatribuição). |
| **Atribuir Técnico** | `OPEN` | `ADMIN` | Abre modal para escolher técnico ativo da lista. |
| **Reatribuir Técnico** | `IN_PROGRESS` ou `OPEN` | `ADMIN` | Abre modal para alterar técnico responsável. |
| **Resolver Chamado** | `IN_PROGRESS` | `TECHNICIAN` (responsável) ou `ADMIN` | Abre modal com campo opcional de solução e confirmação. |
| **Encerrar Chamado** | `RESOLVED` | `ADMIN` | Abre modal de confirmação de encerramento final. |
| **Reabrir Chamado** | `RESOLVED` ou `CLOSED` | `USER` (solicitante) ou `ADMIN` | Abre modal com campo opcional de motivo de reabertura. |

---

## Estrutura da Feature

```text
src/features/tickets/
├── api/
│   ├── tickets.api.ts                   # Métodos HTTP do ciclo de vida
│   └── tickets.api.test.ts              # Testes unitários das chamadas PATCH
├── types/
│   └── tickets.types.ts                 # Payloads de atribuição, resolução, reabertura
├── components/
│   ├── TicketActionsBar.tsx             # Barra contextual com botões de ação do chamado
│   ├── TicketActionsBar.test.tsx        # Testes de visibilidade por papel e status
│   ├── AssignTicketModal.tsx            # Modal de atribuição/reatribuição de técnico
│   ├── AssignTicketModal.test.tsx       # Testes de submissão e seleção de técnico
│   ├── ResolveTicketModal.tsx           # Modal de resolução de chamado
│   ├── ResolveTicketModal.test.tsx      # Testes de resolução com solução opcional
│   ├── CloseTicketModal.tsx             # Modal de confirmação de encerramento
│   ├── CloseTicketModal.test.tsx        # Testes de confirmação de encerramento
│   ├── ReopenTicketModal.tsx            # Modal de reabertura de chamado
│   └── ReopenTicketModal.test.tsx       # Testes de reabertura com motivo opcional
└── pages/
    ├── TicketDetailPage.tsx             # Página de detalhe integrada com TicketActionsBar
    └── TicketDetailPage.test.tsx        # Testes de integração de ações no detalhe
```

---

## Detalhamento das Etapas de Implementação

---

### Etapa 1 — Tipos e Métodos da API (`tickets.types.ts` e `tickets.api.ts`)

**Objetivo:** Adicionar os tipos de payload e os métodos de requisição HTTP correspondentes aos 5 endpoints `PATCH` do backend.

**Arquivos a modificar:**
```text
src/features/tickets/
├── types/tickets.types.ts
├── api/tickets.api.ts
└── api/tickets.api.test.ts
```

**Contratos:**
- `AssignTicketPayload`: `{ assigneeId?: string }`
- `ReassignTicketPayload`: `{ assigneeId: string }`
- `ResolveTicketPayload`: `{ solutionNotes?: string }`
- `ReopenTicketPayload`: `{ reopenReason?: string }`
- Métodos em `ticketsApi`:
  - `assignTicket(id: string, payload?: AssignTicketPayload): Promise<Ticket>`
  - `reassignTicket(id: string, payload: ReassignTicketPayload): Promise<Ticket>`
  - `resolveTicket(id: string, payload?: ResolveTicketPayload): Promise<Ticket>`
  - `closeTicket(id: string): Promise<Ticket>`
  - `reopenTicket(id: string, payload?: ReopenTicketPayload): Promise<Ticket>`

**Checklist:**
- [ ] Adicionar interfaces de payload em `tickets.types.ts`
- [ ] Implementar os 5 métodos PATCH em `tickets.api.ts`
- [ ] Criar testes unitários para cada método em `tickets.api.test.ts`
- [ ] Executar `npm run test` validando sucesso dos testes de API

---

### Etapa 2 — Modais de Resolução, Encerramento e Reabertura

**Objetivo:** Criar os componentes modais acessíveis com feedback visual e tratamento de erro para as transições finais de estado.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── ResolveTicketModal.tsx
├── ResolveTicketModal.test.tsx
├── CloseTicketModal.tsx
├── CloseTicketModal.test.tsx
├── ReopenTicketModal.tsx
└── ReopenTicketModal.test.tsx
```

**Comportamento:**
- `ResolveTicketModal`: Textarea opcional para notas da solução, botão de submissão com loading e fechamento automático após sucesso.
- `CloseTicketModal`: Alerta informando que o chamado será finalizado permanentemente.
- `ReopenTicketModal`: Textarea opcional para motivo da reabertura e botão de confirmação.

**Checklist:**
- [ ] Criar `ResolveTicketModal` com testes unitários
- [ ] Criar `CloseTicketModal` com testes unitários
- [ ] Criar `ReopenTicketModal` com testes unitários
- [ ] Executar `npm run test` garantindo 100% de cobertura nos modais

---

### Etapa 3 — Modal de Atribuição e Reatribuição (`AssignTicketModal`)

**Objetivo:** Criar o componente modal para que administradores atribuam ou reatribuam o chamado para técnicos cadastrados e ativos.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── AssignTicketModal.tsx
└── AssignTicketModal.test.tsx
```

**Comportamento:**
- Carrega a lista de técnicos via `usersApi.getUsers({ role: 'TECHNICIAN' })`.
- Exibe dropdown/select com os técnicos disponíveis.
- Diferencia visualmente entre "Atribuir Chamado" e "Reatribuir Chamado" com base na presença de `ticket.assigneeId`.
- Dispara `assignTicket` ou `reassignTicket` e emite callback `onSuccess`.

**Checklist:**
- [ ] Criar componente `AssignTicketModal`
- [ ] Criar testes unitários em `AssignTicketModal.test.tsx`
- [ ] Executar `npm run test` garantindo aprovação dos testes

---

### Etapa 4 — Barra de Ações e Integração na `TicketDetailPage`

**Objetivo:** Montar a barra de ações contextuais (`TicketActionsBar`) com base nas permissões RBAC e integrá-la na página de detalhe do chamado.

**Arquivos a criar/modificar:**
```text
src/features/tickets/
├── components/
│   ├── TicketActionsBar.tsx
│   └── TicketActionsBar.test.tsx
└── pages/
    ├── TicketDetailPage.tsx
    └── TicketDetailPage.test.tsx
```

**Comportamento da `TicketActionsBar`:**
- Identifica o usuário logado via `useAuth()`.
- Exibe dinamicamente:
  - Botão "Assumir Chamado" para `TECHNICIAN` se o chamado estiver `OPEN` e sem responsável.
  - Botão "Atribuir / Reatribuir" para `ADMIN`.
  - Botão "Resolver Chamado" para o técnico atribuído ou `ADMIN` se `IN_PROGRESS`.
  - Botão "Encerrar Chamado" para `ADMIN` se `RESOLVED`.
  - Botão "Reabrir Chamado" para solicitante (`USER`) ou `ADMIN` se `RESOLVED` ou `CLOSED`.
- Atualiza o estado local do chamado em `TicketDetailPage` sem recarregar a página inteira após cada ação bem-sucedida.

**Checklist:**
- [ ] Criar `TicketActionsBar` com regras de renderização condicional por papel e status
- [ ] Criar testes unitários para `TicketActionsBar.test.tsx`
- [ ] Integrar `TicketActionsBar` no `TicketDetailPage.tsx`
- [ ] Atualizar e expandir testes de `TicketDetailPage.test.tsx`
- [ ] Executar `npm run test` garantindo 100% de sucesso

---

### Etapa 5 — Suíte Completa de Testes e Build do Frontend

**Objetivo:** Validar que todo o frontend compila perfeitamente e que todos os testes unitários e de integração passam sem regressões.

**Checklist:**
- [ ] Executar validação de tipos e compilação do Vite (`npm run build`)
- [ ] Executar suíte completa de testes do frontend (`npm run test`)
- [ ] Atualizar `docs/ROADMAP.md` marcando a Fase 5 Frontend como concluída

---

## Ordem de Execução Recomendada

```text
Etapa 1 (API & Tipos) ➔ Etapa 2 (Modais Resolve/Close/Reopen) ➔ Etapa 3 (Modal Atribuição) ➔ Etapa 4 (ActionsBar & Detalhe) ➔ Etapa 5 (Build & Suíte Geral)
```

---

## Critérios de Conclusão da Fase 5 (Frontend)

- [ ] Técnico visualiza e clica em "Assumir Chamado" em chamados abertos.
- [ ] ADMIN visualiza e atribui/reatribui técnicos através do `AssignTicketModal`.
- [ ] Técnico responsável ou ADMIN consegue resolver chamados em andamento via `ResolveTicketModal`.
- [ ] ADMIN encerra chamados resolvidos via `CloseTicketModal`.
- [ ] Solicitante ou ADMIN consegue reabrir chamados finalizados via `ReopenTicketModal`.
- [ ] Os botões de ação aparecem e desaparecem estritamente de acordo com o papel e o estado do chamado.
- [ ] Todos os testes do frontend executando 100% verdes e build do Vite aprovado.
