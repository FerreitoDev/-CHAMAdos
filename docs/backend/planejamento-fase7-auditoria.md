# Planejamento Técnico — Fase 7 Backend: Módulo de Auditoria

Este documento detalha o plano de implementação do **Módulo de Auditoria** no backend do **CHAMAdos**. Cada etapa é estritamente modular, testável e segue os padrões de código, TypeScript estrito, Zero Any e RPI estabelecidos no projeto.

---

## 1. Visão Geral e Objetivos

O módulo de auditoria é responsável pelo rastreamento e registro imutável de todas as ações operacionais relevantes ocorridas no ciclo de vida dos chamados (criação, atribuição, reatribuição, resolução, encerramento e reabertura).

**Fundação disponível no Backend:**
- Model `Audit` no Prisma (`id`, `action`, `data: Json?`, `ticketId?`, `actorId?`, `createdAt`).
- `TicketsModule`, `UsersModule`, `AuthModule`, `CommentsModule` e `PrismaModule` 100% operacionais.
- Guards e Decorators globais: `JwtAuthGuard`, `RolesGuard`, `@Roles()` e `@CurrentUser()`.

---

## 2. Regras de Negócio e Controle de Acesso (RBAC)

### 2.1. Registro de Eventos (`AuditService.log`)
- Não expõe rota REST de escrita pública ou direta: todos os registros são criados exclusivamente de forma programática pelo backend.
- Eventos registrados:
  - `TICKET_CREATED`: Quando um chamado é criado (dados: título, prioridade, categoria).
  - `TICKET_ASSIGNED`: Quando um técnico assume ou um ADMIN atribui o chamado (dados: técnico anterior, novo técnico, novo status).
  - `TICKET_REASSIGNED`: Quando um ADMIN transfere o chamado para outro técnico (dados: técnico anterior, novo técnico).
  - `TICKET_RESOLVED`: Quando o chamado é marcado como resolvido (dados: status anterior, status atual).
  - `TICKET_CLOSED`: Quando o chamado é encerrado pelo ADMIN (dados: status anterior, status atual).
  - `TICKET_REOPENED`: Quando o chamado é reaberto pelo solicitante ou ADMIN (dados: status anterior, status atual).

### 2.2. Consulta de Histórico de Auditoria (`GET /tickets/:ticketId/audit`)
- **Regras de Acesso:**
  - **Administrador (`ADMIN`)**: Visualiza o histórico de auditoria de qualquer chamado.
  - **Técnico Responsável (`TECHNICIAN`)**: Visualiza o histórico de auditoria apenas se for o responsável atribuído ao chamado (`ticket.assigneeId === currentUser.id`).
  - **Técnico Não Responsável / Usuário Solicitante (`USER`)**: Não possuem permissão para ver auditoria interna do sistema (`403 ForbiddenException('Você não tem permissão para acessar o histórico de auditoria deste chamado')`).
- **Validação de Existência**: Se o chamado não for encontrado, lança `404 NotFoundException('Chamado não encontrado')`.
- **Ordenação**: Histórico retornado sempre em ordem cronológica ascendente (`orderBy: { createdAt: 'asc' }`).
- **Sanitização**: O ator (`actor`) retorna com `safeUserSelect` (sem expor `passwordHash`).

---

## 3. Estrutura de Arquivos

```text
backend/src/audit/
├── audit.constants.ts
├── audit.types.ts
├── audit.service.ts
├── audit.service.spec.ts
├── audit.controller.ts
├── audit.controller.spec.ts
└── audit.module.ts
```

---

## 4. Detalhamento das Etapas de Implementação

---

### Etapa 1 — Constantes e Tipos (`audit.constants.ts` e `audit.types.ts`)

**Objetivo:** Centralizar os enums/constantes de ações de auditoria e definir as tipagens seguras do payload e resposta.

**Arquivos a criar:**
```text
backend/src/audit/
├── audit.constants.ts
└── audit.types.ts
```

**Definições:**
- `AUDIT_ACTIONS`:
  - `TICKET_CREATED = 'TICKET_CREATED'`
  - `TICKET_ASSIGNED = 'TICKET_ASSIGNED'`
  - `TICKET_REASSIGNED = 'TICKET_REASSIGNED'`
  - `TICKET_RESOLVED = 'TICKET_RESOLVED'`
  - `TICKET_CLOSED = 'TICKET_CLOSED'`
  - `TICKET_REOPENED = 'TICKET_REOPENED'`
- `SafeAudit`:
  - `id: string`
  - `action: string`
  - `data: Record<string, unknown> | null`
  - `ticketId: string | null`
  - `actorId: string | null`
  - `createdAt: Date`
  - `actor: SafeUser | null`

**Checklist:**
- [x] Criar `audit.constants.ts` com `AUDIT_ACTIONS` centralizadas
- [x] Criar `audit.types.ts` com `SafeAudit`, `AuditAction` e helpers de seleção segura
- [x] Validar compilação (`npm run build`)

---

### Etapa 2 — `AuditService` e Testes Unitários

**Objetivo:** Implementar o serviço de auditoria com métodos para inserção programática (`log`) e consulta protegida (`findAllByTicket`).

**Arquivos a criar:**
```text
backend/src/audit/
├── audit.service.ts
└── audit.service.spec.ts
```

**Métodos a implementar:**
- `log(action: AuditAction, ticketId?: string, actorId?: string, data?: Record<string, unknown>): Promise<SafeAudit>`
- `findAllByTicket(ticketId: string, user: AuthenticatedUser): Promise<SafeAudit[]>`

**Checklist:**
- [x] Implementar `AuditService.log` inserindo registro no Prisma
- [x] Implementar `AuditService.findAllByTicket` com checagem de existência (404) e RBAC (403 para não-ADMIN e técnico não-atribuído)
- [x] Criar testes unitários em `audit.service.spec.ts` cobrindo cenários de sucesso e erro (404, 403)
- [x] Executar testes com `npm run test audit.service` com 100% de aprovação

---

### Etapa 3 — Integração do `AuditService` no `TicketsService`

**Objetivo:** Chamar `AuditService.log` em cada evento do ciclo de atendimento em `TicketsService`.

**Arquivos a modificar:**
```text
backend/src/
├── tickets/tickets.service.ts
├── tickets/tickets.service.spec.ts
└── tickets/tickets.module.ts
```

**Ações integradas:**
1. `create` ➔ Dispara `TICKET_CREATED` com dados do chamado criado
2. `assign` ➔ Dispara `TICKET_ASSIGNED` com técnico anterior e novo
3. `reassign` ➔ Dispara `TICKET_REASSIGNED` com técnico anterior e novo
4. `resolve` ➔ Dispara `TICKET_RESOLVED` com status anterior
5. `close` ➔ Dispara `TICKET_CLOSED` com status anterior
6. `reopen` ➔ Dispara `TICKET_REOPENED` com status anterior

**Checklist:**
- [x] Injetar `AuditService` no `TicketsService`
- [x] Adicionar chamadas de auditoria nos 6 métodos de ciclo de vida
- [x] Atualizar suíte de testes `tickets.service.spec.ts` validando a invocação do `auditService.log`
- [x] Executar `npm run test tickets.service` garantindo 100% verdes

---

### Etapa 4 — `AuditController`, `AuditModule` e Registro no `AppModule`

**Objetivo:** Expor endpoint REST `GET /tickets/:ticketId/audit` protegido por JWT e roles (`ADMIN`, `TECHNICIAN`), encapsular o módulo e registrá-lo.

**Arquivos a criar/modificar:**
```text
backend/src/
├── audit/audit.controller.ts
├── audit/audit.controller.spec.ts
├── audit/audit.module.ts
├── tickets/tickets.module.ts
└── app.module.ts
```

**Checklist:**
- [x] Criar `AuditController` com `@Controller('tickets/:ticketId/audit')` e rota `GET`
- [x] Criar `AuditModule` exportando `AuditService`
- [x] Importar `AuditModule` no `TicketsModule` e no `AppModule`
- [x] Criar testes unitários em `audit.controller.spec.ts`
- [x] Validar compilação (`npm run build`) e testes (`npm run test audit`)

---

### Etapa 5 — Suíte Geral de Testes e Integração no Roadmap

**Objetivo:** Garantir zero regressões em todo o ecossistema do backend e atualizar os documentos de acompanhamento.

**Checklist:**
- [ ] Executar `npm run build` com sucesso
- [ ] Executar `npm run test` com 100% de aprovação em todos os módulos
- [ ] Atualizar `docs/ROADMAP.md` marcando a Fase 7 Backend como concluída

---

## Critérios de Conclusão da Fase 7 (Backend)

- [ ] Todas as 6 ações do ciclo de vida de tickets geram registros imutáveis de auditoria.
- [ ] ADMIN visualiza o histórico completo de auditoria de qualquer chamado.
- [ ] Técnico responsável visualiza o histórico de auditoria do chamado sob sua responsabilidade.
- [ ] Usuários comuns e técnicos não atribuídos recebem `403 Forbidden` ao consultar a auditoria.
- [ ] Histórico retornado em ordem cronológica ascendente com ator sanitizado (sem expor `passwordHash`).
- [ ] 100% dos testes unitários passando sem erros.
