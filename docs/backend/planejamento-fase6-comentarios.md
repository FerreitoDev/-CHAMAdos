# Planejamento Técnico — Fase 6 Backend: Módulo de Comentários

Este documento detalha as etapas de implementação do módulo de comentários em chamados no backend do **CHAMAdos**. Cada etapa é independente, modular e possui cobertura de testes unitários obrigatória.

**Fundação disponível (Backend Fases 1 a 5 100% operacionais):**
- Schema Prisma com model `Comment` (`id`, `content`, `ticketId`, `authorId`, `createdAt`), relacionado com `Ticket` e `User`.
- `TicketsModule`, `UsersModule`, `PrismaModule` operacionais com RBAC e regras de ciclo de vida.
- Guards e Decorators: `JwtAuthGuard`, `RolesGuard`, `@Roles()` e `@CurrentUser()`.

---

## Regras de Negócio e Controle de Acesso (RBAC)

### 1. Visualização de Comentários (`GET /tickets/:ticketId/comments`)
- **Regra de Acesso:**
  - **Administrador (`ADMIN`)**: Pode visualizar comentários de qualquer chamado no sistema.
  - **Técnico (`TECHNICIAN`)**: Pode visualizar se for o técnico responsável (`ticket.assigneeId === currentUser.id`), o solicitante (`ticket.requesterId === currentUser.id`) ou se o chamado estiver aberto e vago (`ticket.assigneeId === null`).
  - **Solicitante (`USER`)**: Pode visualizar se for o autor do chamado (`ticket.requesterId === currentUser.id`).
  - **Não autorizados**: Retorna `403 ForbiddenException('Você não tem permissão para acessar os comentários deste chamado')`.
- **Validação de Existência**: Se o chamado não for encontrado, lança `404 NotFoundException('Chamado não encontrado')`.
- **Ordenação**: Os comentários devem ser retornados sempre em ordem cronológica ascendente (`orderBy: { createdAt: 'asc' }`).
- **Sanitização**: Os dados do autor devem utilizar `safeUserSelect` (sem expor `passwordHash`).

### 2. Criação de Comentário (`POST /tickets/:ticketId/comments`)
- **Contrato de Entrada**: `CreateCommentDto` (`content: string`, obrigatório, sem espaços vazios, tamanho de 1 a 5000 caracteres).
- **Regras de Negócio:**
  - **Chamados Encerrados**: Não é permitido adicionar comentários em chamados com status `CLOSED`. Caso tente, lança `UnprocessableEntityException('Não é possível adicionar comentários em um chamado encerrado')`.
  - **Administrador (`ADMIN`)**: Pode comentar em qualquer chamado (exceto encerrados).
  - **Técnico (`TECHNICIAN`)**: Pode comentar apenas se for o técnico atribuído ao chamado (`ticket.assigneeId === currentUser.id`) ou o solicitante (`ticket.requesterId === currentUser.id`). Caso o chamado não esteja atribuído a ele, lança `ForbiddenException('Você não tem permissão para comentar neste chamado')`.
  - **Solicitante (`USER`)**: Pode comentar se for o solicitante do chamado (`ticket.requesterId === currentUser.id`). Caso contrário, lança `ForbiddenException('Você não tem permissão para comentar neste chamado')`.
- **Efeito Colateral**: O comentário é criado vinculado a `ticketId`, `authorId` (`currentUser.id`) e `createdAt = new Date()`.

---

## Estrutura da Feature no Backend

```text
backend/src/comments/
├── dto/
│   └── create-comment.dto.ts
├── comments.types.ts
├── comments.service.ts
├── comments.service.spec.ts
├── comments.controller.ts
├── comments.controller.spec.ts
└── comments.module.ts
```

---

## Detalhamento das Etapas de Implementação

---

### Etapa 1 — DTOs e Tipos (`create-comment.dto.ts` e `comments.types.ts`)

**Objetivo:** Definir os contratos de validação de dados de entrada com `class-validator` e a tipagem sanitizada para comentários.

**Arquivos a criar:**
```text
backend/src/comments/
├── dto/create-comment.dto.ts
└── comments.types.ts
```

**Contratos:**
- `CreateCommentDto`:
  - `content`: `@IsString()`, `@IsNotEmpty()`, `@MaxLength(5000)`
- `SafeComment`:
  - `id`: string
  - `content`: string
  - `ticketId`: string
  - `authorId`: string
  - `createdAt`: Date
  - `author`: `SafeUser` (id, name, email, role, active, createdAt, updatedAt)

**Checklist:**
- [x] Criar `CreateCommentDto` com validações de string e tamanho
- [x] Criar `comments.types.ts` com `SafeComment` e helpers de seleção segura
- [x] Validar compilação com `npm run build`

---

### Etapa 2 — Regras de Negócio no `CommentsService`

**Objetivo:** Implementar a lógica de listagem e criação de comentários com verificação de autorização e validação de chamado encerrado.

**Arquivos a criar:**
```text
backend/src/comments/
├── comments.service.ts
└── comments.service.spec.ts
```

**Métodos a implementar:**
- `create(ticketId: string, user: AuthenticatedUser, dto: CreateCommentDto): Promise<SafeComment>`
- `findAllByTicket(ticketId: string, user: AuthenticatedUser): Promise<SafeComment[]>`

**Checklist:**
- [x] Implementar `create` com validação de status `CLOSED` e verificação de participação
- [x] Implementar `findAllByTicket` com ordenação cronológica e sanitização do autor
- [x] Criar testes unitários em `comments.service.spec.ts` cobrindo cenários de sucesso e erros (404, 403, 422)
- [x] Executar testes com `npm run test comments.service` garantindo 100% verdes

---

### Etapa 3 — Endpoints REST no `CommentsController`

**Objetivo:** Expor as rotas HTTP de comentários protegidas por JWT e validação de papéis.

**Arquivos a criar:**
```text
backend/src/comments/
├── comments.controller.ts
└── comments.controller.spec.ts
```

**Endpoints:**

| Método | Rota | Guards / Roles | Descrição |
|---|---|---|---|
| `POST` | `/tickets/:ticketId/comments` | `JwtAuthGuard`, `@Roles(USER, TECHNICIAN, ADMIN)` | Adiciona comentário no chamado |
| `GET` | `/tickets/:ticketId/comments` | `JwtAuthGuard`, `@Roles(USER, TECHNICIAN, ADMIN)` | Lista comentários do chamado |

**Checklist:**
- [x] Criar `CommentsController` com decorators de rota `@Controller('tickets/:ticketId/comments')`
- [x] Escrever testes unitários em `comments.controller.spec.ts`
- [x] Executar `npm run test comments.controller` garantindo 100% verdes

---

### Etapa 4 — Registro do `CommentsModule` no `AppModule`

**Objetivo:** Configurar o módulo de comentários e integrá-lo na árvore de dependências da aplicação.

**Arquivos a criar/modificar:**
```text
backend/src/
├── comments/comments.module.ts
└── app.module.ts
```

**Checklist:**
- [x] Criar `CommentsModule` com `CommentsController` e `CommentsService`
- [x] Importar `CommentsModule` no `AppModule`
- [x] Validar compilação do NestJS (`npm run build`)

---

### Etapa 5 — Suíte Geral de Testes e Integração no Roadmap

**Objetivo:** Validar o funcionamento de toda a suíte de testes de regressão do backend e atualizar o documento de Roadmap.

**Checklist:**
- [ ] Executar `npm run build` garantindo zero erros de compilação
- [ ] Executar `npm run test` com 100% de aprovação em todos os módulos
- [ ] Atualizar `docs/ROADMAP.md` marcando a Fase 6 Backend como concluída

---

## Ordem de Execução Recomendada

```text
Etapa 1 (DTO & Types) ➔ Etapa 2 (Service + Testes) ➔ Etapa 3 (Controller + Testes) ➔ Etapa 4 (Module & AppModule) ➔ Etapa 5 (Build & Suíte Geral)
```

---

## Critérios de Conclusão da Fase 6 (Backend)

- [ ] Solicitante do chamado consegue adicionar comentários e visualizá-los.
- [ ] Técnico responsável ou ADMIN consegue adicionar comentários no chamado.
- [ ] Técnico não atribuído ou usuário que não seja o solicitante recebe `403 Forbidden` ao tentar comentar.
- [ ] Tentativa de comentar em chamado com status `CLOSED` retorna `422 Unprocessable Entity`.
- [ ] Comentários retornam ordenados em ordem cronológica ascendente com autor sanitizado.
- [ ] Todos os testes unitários de `CommentsService` e `CommentsController` executando 100% verdes.
