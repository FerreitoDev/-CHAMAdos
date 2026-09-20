# Planejamento Técnico — Fase 5 Backend: Ciclo de Atendimento de Chamados

Este documento detalha as etapas de implementação do ciclo de atendimento e transição de estados dos chamados no backend do **CHAMAdos**. Cada etapa é independente, testável e possui a execução de testes obrigatória ao final de sua conclusão.

**Fundação disponível (Backend Fase 4 100% pronto):**
- `TicketsModule`, `TicketsService`, `TicketsController` operacionais com criação, listagem por papel (RBAC) e detalhamento.
- Schema Prisma com enums `TicketStatus` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `TicketPriority`, models `Ticket`, `User`, `Category` e `SystemSettings`.
- Guards de segurança e autorização: `JwtAuthGuard`, `RolesGuard`, `@Roles()` e `@CurrentUser()`.

---

## Regras de Negócio e Máquina de Estados

### 1. Máquina de Estados (State Machine)
As transições de estado válidas no sistema são estritamente delimitadas conforme a tabela abaixo:

| Estado Origem | Estado Destino | Ação | Papéis Permitidos |
|---|---|---|---|
| `OPEN` | `IN_PROGRESS` | Atribuir ou assumir chamado | `TECHNICIAN`, `ADMIN` |
| `IN_PROGRESS` | `OPEN` | Desatribuir chamado | `ADMIN` |
| `IN_PROGRESS` | `RESOLVED` | Resolver chamado | `TECHNICIAN` (responsável), `ADMIN` |
| `RESOLVED` | `CLOSED` | Encerrar chamado | `ADMIN` |
| `RESOLVED` | `OPEN` | Reabrir chamado | `USER` (solicitante), `ADMIN` |
| `CLOSED` | `OPEN` | Reabrir chamado encerrado | `USER` (solicitante), `ADMIN` |

**Regra de Transição Inválida:** Qualquer tentativa de alteração de estado não permitida pela tabela (ex: tentar mudar de `OPEN` diretamente para `CLOSED` ou de `IN_PROGRESS` para `CLOSED`) **deve obrigatoriamente lançar `UnprocessableEntityException` (422)** com a mensagem: `"Transição de estado inválida de {statusAtual} para {novoStatus}"`.

### 2. Atribuição e Autoatribuição (`PATCH /tickets/:id/assign`)
- **Técnico (`TECHNICIAN`)**: Pode assumir um chamado que não possui responsável (`assigneeId === null`).
  - **Validação de Configuração do Sistema**: O serviço deve consultar o registro de `SystemSettings`. Se `allowTechnicianSelfAssignment === false`, o técnico é impedido de se autoatribuir, lançando `ForbiddenException('Autoatribuição de técnicos está desabilitada pelo sistema')`.
- **Administrador (`ADMIN`)**: Pode atribuir o chamado a qualquer técnico ativo informando `assigneeId` no DTO.
- **Efeito Colateral de Estado**: Atribuir um técnico altera automaticamente o status de `OPEN` para `IN_PROGRESS`.

### 3. Reatribuição (`PATCH /tickets/:id/reassign`)
- Exclusivo para o papel `ADMIN`.
- Recebe o ID do novo técnico responsável via `ReassignTicketDto`.
- Atualiza `assigneeId` e garante que o status esteja em `IN_PROGRESS`.

### 4. Resolução (`PATCH /tickets/:id/resolve`)
- Permitido para o **Técnico responsável** (`ticket.assigneeId === currentUser.id`) ou **ADMIN**.
- O chamado **deve estar obrigatoriamente** em `IN_PROGRESS`.
- Altera `status` para `RESOLVED` e define a data de resolução `resolvedAt = new Date()`.

### 5. Encerramento (`PATCH /tickets/:id/close`)
- Exclusivo para o papel `ADMIN`.
- **Regra Rígida de Negócio**: Um chamado não pode ser encerrado sem ser resolvido previamente. O chamado **deve estar em `RESOLVED`**.
- Caso esteja em outro estado (`OPEN` ou `IN_PROGRESS`), lança `UnprocessableEntityException('Um chamado só pode ser encerrado após ser resolvido')`.
- Altera `status` para `CLOSED` e define a data de encerramento `closedAt = new Date()`.

### 6. Reabertura (`PATCH /tickets/:id/reopen`)
- Permitido para o **Solicitante (`USER`)** (`ticket.requesterId === currentUser.id`) ou **ADMIN**.
- O chamado **deve estar em `RESOLVED` ou `CLOSED`**.
- Altera `status` para `OPEN`, e limpa os campos de data: `resolvedAt = null` e `closedAt = null`.

---

## Estrutura das Etapas de Implementação

```text
backend/src/tickets/
├── dto/
│   ├── assign-ticket.dto.ts
│   ├── reassign-ticket.dto.ts
│   ├── resolve-ticket.dto.ts
│   └── reopen-ticket.dto.ts
├── tickets.service.ts
├── tickets.service.spec.ts
├── tickets.controller.ts
└── tickets.controller.spec.ts
```

---

## Detalhamento das Etapas

---

### Etapa 1 — DTOs do Ciclo de Atendimento

**Objetivo:** Definir os contratos de entrada para as operações de atribuição, reatribuição e alteração de estado.

**Arquivos a criar:**
```text
src/tickets/dto/
├── assign-ticket.dto.ts
├── reassign-ticket.dto.ts
├── resolve-ticket.dto.ts
└── reopen-ticket.dto.ts
```

**Contratos:**
- `AssignTicketDto`: Campo `assigneeId?: string` (`@IsUUID()`, `@IsOptional()`). Se omitido por um técnico, indica autoatribuição.
- `ReassignTicketDto`: Campo `assigneeId: string` (`@IsUUID()`, `@IsNotEmpty()`).
- `ResolveTicketDto`: Opcional `solutionNotes?: string`.
- `ReopenTicketDto`: Opcional `reopenReason?: string`.

**Checklist:**
- [x] Criar `AssignTicketDto` e `ReassignTicketDto`
- [x] Criar `ResolveTicketDto` e `ReopenTicketDto`
- [x] Executar validação de tipos e compilação do TypeScript (`npm run build`)

---

### Etapa 2 — Máquina de Estados e Atribuição no `TicketsService` (`assign`, `reassign`)

**Objetivo:** Implementar no `TicketsService` o validador de transição de estado e os métodos de atribuição e reatribuição com verificação de `allowTechnicianSelfAssignment`.

**Métodos a implementar:**
- `validateStateTransition(currentStatus: TicketStatus, newStatus: TicketStatus): void`
- `assign(id: string, user: AuthenticatedUser, dto?: AssignTicketDto): Promise<SafeTicket>`
- `reassign(id: string, user: AuthenticatedUser, dto: ReassignTicketDto): Promise<SafeTicket>`

**Checklist:**
- [x] Implementar validador centralizado de transições de estado (`UnprocessableEntityException`)
- [x] Implementar `assign` com consulta ao `SystemSettings` (`allowTechnicianSelfAssignment`)
- [x] Implementar `reassign` com atribuição exclusiva para ADMIN
- [x] Executar testes unitários em `tickets.service.spec.ts` (`npm run test tickets.service`) garantindo 100% verdes

---

### Etapa 3 — Resolução, Encerramento e Reabertura no `TicketsService` (`resolve`, `close`, `reopen`)

**Objetivo:** Implementar as transições de estado finais do chamado com atualização dos campos de data (`resolvedAt`, `closedAt`).

**Métodos a implementar:**
- `resolve(id: string, user: AuthenticatedUser, dto?: ResolveTicketDto): Promise<SafeTicket>`
- `close(id: string, user: AuthenticatedUser): Promise<SafeTicket>`
- `reopen(id: string, user: AuthenticatedUser, dto?: ReopenTicketDto): Promise<SafeTicket>`

**Checklist:**
- [x] Implementar `resolve` com validação de técnico responsável ou ADMIN
- [x] Implementar `close` com validação estrita de estado prévio `RESOLVED`
- [x] Implementar `reopen` com reset dos campos `resolvedAt` e `closedAt`
- [x] Executar testes unitários em `tickets.service.spec.ts` (`npm run test tickets.service`) garantindo 100% verdes

---

### Etapa 4 — Endpoints REST no `TicketsController`

**Objetivo:** Expor as rotas HTTP do tipo `PATCH` para controle do ciclo de atendimento com proteções por papel.

**Endpoints:**

| Método | Rota | Guards / Roles | Descrição |
|---|---|---|---|
| `PATCH /tickets/:id/assign` | Assumir / Atribuir | `JwtAuthGuard`, `@Roles(TECHNICIAN, ADMIN)` | Técnico assume ou ADMIN atribui chamado |
| `PATCH /tickets/:id/reassign` | Reatribuir | `JwtAuthGuard`, `@Roles(ADMIN)` | ADMIN altera o técnico responsável |
| `PATCH /tickets/:id/resolve` | Resolver | `JwtAuthGuard`, `@Roles(TECHNICIAN, ADMIN)` | Marca o chamado como `RESOLVED` |
| `PATCH /tickets/:id/close` | Encerrar | `JwtAuthGuard`, `@Roles(ADMIN)` | Marca o chamado como `CLOSED` |
| `PATCH /tickets/:id/reopen` | Reabrir | `JwtAuthGuard`, `@Roles(USER, ADMIN)` | Reabre chamado `RESOLVED` ou `CLOSED` |

**Checklist:**
- [ ] Adicionar os 5 endpoints no `TicketsController` com os devidos decorators de rota e `@Roles()`
- [ ] Escrever e executar testes unitários em `tickets.controller.spec.ts` (`npm run test tickets.controller`) garantindo 100% verdes

---

### Etapa 5 — Integração no `AppModule` e Suíte Completa de Testes

**Objetivo:** Garantir a compilação final do backend e validar o funcionamento de toda a suíte de testes de regressão.

**Checklist:**
- [ ] Verificar compilação NestJS (`npm run build`)
- [ ] Executar suíte completa de testes unitários do backend (`npm run test`) para validar 100% de sucesso

---

## Ordem de Execução Recomendada

```
Etapa 1 (DTOs + Build) → Etapa 2 (Assign/Reassign + Testes) → Etapa 3 (Resolve/Close/Reopen + Testes) → Etapa 4 (Controller + Testes) → Etapa 5 (Build & Suíte Geral)
```

---

## Critérios de Conclusão da Fase 5 (Backend)

- [ ] Técnico assume chamado vago e chamado transiciona automaticamente para `IN_PROGRESS`.
- [ ] Técnico é impedido de se autoatribuir quando `allowTechnicianSelfAssignment === false`.
- [ ] ADMIN consegue atribuir ou reatribuir chamados a qualquer técnico.
- [ ] Técnico responsável ou ADMIN consegue resolver chamado em `IN_PROGRESS` (preenchendo `resolvedAt`).
- [ ] ADMIN encerra chamados resolvidos (preenchendo `closedAt`).
- [ ] Tentativa de encerrar chamado não resolvido retorna `422 Unprocessable Entity`.
- [ ] Solicitante ou ADMIN consegue reabrir chamados `RESOLVED` ou `CLOSED` (limpando datas de término).
- [ ] Transições inválidas de estado retornam `422 Unprocessable Entity`.
- [ ] Todos os testes unitários do `TicketsService` e `TicketsController` executando 100% verdes.
