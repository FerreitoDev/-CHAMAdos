# Planejamento Técnico — Fase 7 Frontend: Módulo de Auditoria em Chamados

Este documento detalha o plano de implementação da interface de **Auditoria e Linha do Tempo de Rastreabilidade** no frontend do **CHAMAdos**. Cada etapa é estritamente modular, testável e segue os padrões de código, TypeScript estrito, Zero Any e design system do projeto.

---

## 1. Visão Geral e Objetivos

Permitir que administradores e técnicos responsáveis acompanhem a linha do tempo completa e imutável de eventos ocorridos em cada chamado (criação, atribuições, resoluções, encerramentos e reaberturas).

**Fundação disponível no Backend (Fase 7 Backend 100% operacional):**
- `GET /tickets/:ticketId/audit` — Lista os registros de auditoria em ordem cronológica com atores sanitizados.
- Regras de Acesso no Backend:
  - `ADMIN`: Acesso irrestrito ao histórico de auditoria de qualquer chamado.
  - `TECHNICIAN`: Acesso permitido exclusivamente para chamados onde é o responsável atribuído (`ticket.assigneeId === currentUser.id`).
  - `USER`: Acesso proibido (`403 Forbidden`).

---

## 2. Regras de Interface e Comportamento

### 2.1. Controle de Exibição e Permissões no Frontend
- A seção de auditoria deve ser exibida apenas para usuários autorizados:
  - `ADMIN` sempre visualiza a seção de auditoria.
  - `TECHNICIAN` visualiza se for o responsável atribuído ao chamado (`ticket.assigneeId === user.id`).
  - `USER` comum não visualiza a seção de auditoria (nem dispara a requisição desnecessariamente).

### 2.2. Visualização em Linha do Tempo (Timeline)
- Exibir os eventos em ordem cronológica (do primeiro ao mais recente).
- Cada evento na timeline deve destacar:
  - **Ícone Contextual**: Ícones específicos para cada ação (`PlusCircle` para criação, `UserCheck` para atribuição, `ArrowRightLeft` para reatribuição, `CheckCircle2` para resolução, `Lock` para encerramento, `RotateCcw` para reabertura).
  - **Título/Ação Humanizada**: Textos claros e informativos em português (ex.: *"Chamado aberto"*, *"Atribuído ao técnico"*, *"Chamado resolvido"*).
  - **Ator Responsável**: Nome do usuário que executou a ação e seu badge de papel (`UserRoleBadge`).
  - **Data e Hora**: Formatadas no padrão brasileiro (`dd/MM/yyyy HH:mm`).
  - **Detalhes Contextuais**: Exibição de dados relevantes em `data` (ex.: técnico anterior ➔ novo técnico, status de transição).

### 2.3. Estados de Interface
- **Loading State**: Skeleton loading animado durante a busca inicial.
- **Empty State**: Mensagem caso não haja registros de auditoria retornados.
- **Error State**: Mensagem contextual amigável com botão de "Tentar novamente".

---

## 3. Estrutura de Arquivos

```text
frontend/src/features/tickets/
├── api/
│   ├── audit.api.ts                  # Cliente HTTP para GET /tickets/:ticketId/audit
│   └── audit.api.test.ts             # Testes unitários do cliente de auditoria
├── types/
│   └── audit.types.ts                # Interfaces AuditItem, AuditAction e helpers
├── components/
│   ├── TicketAuditItem.tsx           # Item individual da timeline de auditoria
│   ├── TicketAuditItem.test.tsx      # Testes de renderização de cada tipo de evento
│   ├── TicketAuditSection.tsx        # Seção completa com timeline, loading, empty e error states
│   └── TicketAuditSection.test.tsx   # Testes unitários da seção e controle de permissões
└── pages/
    ├── TicketDetailPage.tsx          # Integração da seção de auditoria na página de detalhes
    └── TicketDetailPage.test.tsx     # Testes da página com a seção de auditoria para ADMIN/TECH/USER
```

---

## 4. Detalhamento das Etapas de Implementação

---

### Etapa 1 — Tipos, Constantes e Cliente de API (`audit.types.ts` e `audit.api.ts`)

**Objetivo:** Definir os contratos de dados de auditoria, constantes das ações e criar o método de comunicação HTTP com o backend usando o `httpClient`.

**Arquivos a criar:**
```text
src/features/tickets/
├── types/audit.types.ts
├── api/audit.api.ts
└── api/audit.api.test.ts
```

**Contratos:**
- `AUDIT_ACTIONS`:
  - `TICKET_CREATED = 'TICKET_CREATED'`
  - `TICKET_ASSIGNED = 'TICKET_ASSIGNED'`
  - `TICKET_REASSIGNED = 'TICKET_REASSIGNED'`
  - `TICKET_RESOLVED = 'TICKET_RESOLVED'`
  - `TICKET_CLOSED = 'TICKET_CLOSED'`
  - `TICKET_REOPENED = 'TICKET_REOPENED'`
- `AuditItem`:
  - `id: string`
  - `action: string`
  - `data: Record<string, unknown> | null`
  - `ticketId: string | null`
  - `actorId: string | null`
  - `createdAt: string`
  - `actor: SafeUser | null`
- Métodos em `auditApi`:
  - `getTicketAudit(ticketId: string): Promise<AuditItem[]>`

**Checklist:**
- [x] Criar `audit.types.ts` com constantes e interfaces de auditoria
- [x] Implementar `audit.api.ts` com o método `getTicketAudit`
- [x] Criar testes unitários em `audit.api.test.ts` cobrindo sucesso e tratamento de erros
- [x] Executar `npm run test` validando sucesso dos testes de API

---

### Etapa 2 — Componente de Item da Linha do Tempo (`TicketAuditItem.tsx`)

**Objetivo:** Criar o componente visual que renderiza um único evento da auditoria em formato de nó de timeline com ícone, título humanizado, ator e data.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── TicketAuditItem.tsx
└── TicketAuditItem.test.tsx
```

**Checklist:**
- [ ] Implementar `TicketAuditItem.tsx` com mapeamento visual para as 6 ações de auditoria
- [ ] Renderizar autor (com `UserRoleBadge`), data formatada e detalhes contextuais
- [ ] Criar testes unitários em `TicketAuditItem.test.tsx` verificando renderização para todas as ações
- [ ] Executar `npm run test TicketAuditItem` garantindo 100% de aprovação

---

### Etapa 3 — Seção de Linha do Tempo de Auditoria (`TicketAuditSection.tsx`)

**Objetivo:** Criar a seção agregadora que busca o histórico de auditoria, renderiza a timeline com linha vertical conectora e gerencia estados de loading, erro e empty state.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── TicketAuditSection.tsx
└── TicketAuditSection.test.tsx
```

**Checklist:**
- [ ] Implementar `TicketAuditSection.tsx` com busca assíncrona e estados visuais
- [ ] Aplicar verificação de permissão (`ADMIN` ou `TECHNICIAN` responsável)
- [ ] Criar testes unitários em `TicketAuditSection.test.tsx` testando carregamento, lista de eventos, fallback de erro e permissões
- [ ] Executar `npm run test TicketAuditSection` com 100% de aprovação

---

### Etapa 4 — Integração na Página de Detalhe e Testes (`TicketDetailPage.tsx`)

**Objetivo:** Integrar a seção de auditoria na página de detalhes do chamado (`TicketDetailPage.tsx`) para usuários autorizados e atualizar a suíte de testes.

**Arquivos a modificar:**
```text
src/features/tickets/pages/
├── TicketDetailPage.tsx
└── TicketDetailPage.test.tsx
```

**Checklist:**
- [ ] Integrar `<TicketAuditSection ticket={ticket} />` na `TicketDetailPage.tsx`
- [ ] Atualizar `TicketDetailPage.test.tsx` com testes de exibição condicional por papel de usuário
- [ ] Executar `npm run test TicketDetailPage` garantindo 100% de aprovação

---

### Etapa 5 — Suíte Geral de Testes, Build e Atualização de Documentação

**Objetivo:** Validar a suíte completa de testes de frontend e backend, validar o build de produção do Vite e atualizar os documentos de roadmap.

**Arquivos a modificar:**
```text
docs/
├── ROADMAP.md
└── frontend/planejamento-fase7-auditoria-frontend.md
```

**Checklist:**
- [ ] Executar `npm run build` garantindo zero erros de compilação/tipagem
- [ ] Executar `npm run test` com 100% de aprovação em toda a suíte de testes do frontend
- [ ] Atualizar `docs/ROADMAP.md` marcando as tarefas da Fase 7 Frontend como concluídas

---

## 5. Critérios de Conclusão da Fase 7 (Frontend)

- [ ] Administrador visualiza a linha do tempo de auditoria em qualquer chamado.
- [ ] Técnico responsável visualiza a linha do tempo de auditoria nos chamados atribuídos a ele.
- [ ] Usuário comum (solicitante) e técnicos não atribuídos não visualizam a seção de auditoria.
- [ ] A linha do tempo exibe ícone, ação amigável, ator, papel e data de cada evento.
- [ ] 100% dos testes unitários do frontend passando e build do Vite com 0 erros.
