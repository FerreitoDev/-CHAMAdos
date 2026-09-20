# Planejamento Técnico — Fase 4 Backend: Chamados (Tickets — Núcleo)

Este documento detalha as etapas de implementação do módulo de chamados (núcleo) no backend do **CHAMAdos**. Cada etapa é independente, testável e pode ser comitada separadamente, possuindo obrigatoriamente a execução e validação de testes ao final de sua conclusão.

**Fundação disponível:**
- Schema Prisma com model `Ticket` completo (`id`, `title`, `description`, `status`, `priority`, `requesterId`, `assigneeId`, `categoryId`, `createdAt`, `updatedAt`, `resolvedAt`, `closedAt`).
- Models e enums relacionados: `User`, `Category`, `TicketStatus` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `TicketPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- Security Context pronto: `JwtAuthGuard`, `RolesGuard`, `@Roles()` e `@CurrentUser()`.
- `ValidationPipe` global configurado no NestJS.
- `SafeUser` em `src/users/users.types.ts` para sanitização de dados de usuários.

---

## Regras de Negócio e Segurança

1. **Acesso por Papel (RBAC) e Regras de Visibilidade (Escopo)**:
   - **Criação (`POST /tickets`)**: Permitido para usuários autenticados com papéis `USER`, `TECHNICIAN` e `ADMIN`. O `requesterId` é extraído automaticamente do token JWT (`currentUser.id`).
   - **Listagem (`GET /tickets`)**:
     - `USER`: Visualiza **apenas** os seus próprios chamados (`requesterId = currentUser.id`).
     - `TECHNICIAN`: Visualiza os chamados disponíveis sem responsável (`assigneeId = null`), chamados atribuídos a ele (`assigneeId = currentUser.id`) e chamados solicitados por ele (`requesterId = currentUser.id`).
     - `ADMIN`: Visualiza **todos** os chamados do sistema.
   - **Consulta de Detalhes (`GET /tickets/:id`)**:
     - `USER`: Pode consultar apenas se for o solicitante. Caso contrário: `403 Forbidden`.
     - `TECHNICIAN`: Pode consultar se for o solicitante, se estiver atribuído a ele, ou se o chamado estiver sem responsável. Caso contrário: `403 Forbidden`.
     - `ADMIN`: Pode consultar qualquer chamado.

2. **Validação de Categoria**:
   - Ao criar um chamado, a categoria referenciada pelo `categoryId` **deve existir** no banco e estar **ativa** (`active = true`).
   - Categoria inexistente ou inativa deve retornar `400 Bad Request` com mensagem explicativa.

3. **Estado Inicial e Responsável**:
   - Novo chamado é criado obrigatoriamente com `status = TicketStatus.OPEN`.
   - `assigneeId` inicia como `null` por padrão na criação.
   - `resolvedAt` e `closedAt` iniciam como `null`.

4. **Sanitização de Dados de Usuários**:
   - Os dados do solicitante (`requester`) e responsável (`assignee`) retornados junto ao chamado não devem expor `passwordHash`. Devem utilizar o formato `SafeUser`.

5. **Paginação e Filtros de Busca**:
   - A listagem suporta paginação baseada em `page` (padrão: 1) e `limit` (padrão: 10, máx: 100).
   - Filtros aceitos via Query String: `status`, `priority`, `categoryId`, `assigneeId` (somente para ADMIN) e busca por termo `search` (em `title` e `description`).
   - A resposta de listagem deve ser envelopada com metadados de paginação: `{ data: SafeTicket[], meta: { total, page, limit, totalPages } }`.

---

## Estrutura do Módulo

```text
backend/src/tickets/
├── dto/
│   ├── create-ticket.dto.ts
│   ├── filter-tickets.dto.ts
│   └── ticket-response.dto.ts
├── tickets.types.ts
├── tickets.module.ts
├── tickets.service.ts
├── tickets.service.spec.ts
├── tickets.controller.ts
└── tickets.controller.spec.ts
```

---

## Etapas de Implementação

---

### Etapa 1 — DTOs de Entrada (`CreateTicketDto` e `FilterTicketsDto`)

**Objetivo:** Definir os contratos de entrada e validações para criação e listagem filtrada de chamados.

**Arquivos a criar:**
```
src/tickets/dto/
├── create-ticket.dto.ts
└── filter-tickets.dto.ts
```

**`CreateTicketDto`:**
```typescript
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority; // Padrão: MEDIUM se omitido

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
```

**`FilterTicketsDto`:**
```typescript
export class FilterTicketsDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
```

**Checklist:**
- [x] Criar `CreateTicketDto` com validações via `class-validator`
- [x] Criar `FilterTicketsDto` com conversão de tipos e validações de paginação
- [x] Executar validação de tipos e compilação do TypeScript (`npm run build`)

---

### Etapa 2 — Tipagem e Contrato de Resposta (`tickets.types.ts`)

**Objetivo:** Definir os tipos de retorno seguro do módulo de chamados, garantindo que relações com `User` retornem sem `passwordHash`.

**Arquivo a criar:**
`src/tickets/tickets.types.ts`

```typescript
import { Ticket, Category } from '../generated/prisma';
import { SafeUser } from '../users/users.types';

export type SafeTicket = Omit<Ticket, 'requester' | 'assignee'> & {
  category: Category;
  requester: SafeUser;
  assignee: SafeUser | null;
};

export interface PaginatedTicketsResponse {
  data: SafeTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Mapeadores reutilizáveis:**
Incluir função auxiliar de seleção do Prisma (`safeUserSelect`) ou mapper para formatar `User` em `SafeUser`.

**Checklist:**
- [x] Criar `src/tickets/tickets.types.ts` com `SafeTicket` e `PaginatedTicketsResponse`
- [x] Centralizar `safeUserSelect` para reutilização nas queries Prisma com relacionamentos
- [x] Executar validação de tipos e compilação do TypeScript (`npm run build`)

---

### Etapa 3 — `TicketsService` (Lógica de Negócio e CRUD)

**Objetivo:** Implementar a criação, listagem com regras de visibilidade RBAC e busca de detalhes no `TicketsService`.

**Métodos a implementar:**

| Método | Operação | Observações |
|---|---|---|
| `create(requesterId, dto)` | `prisma.ticket.create` | Valida se a categoria existe e está ativa (`active: true`). Define `status: OPEN` e `priority: MEDIUM` (se não informado). |
| `findAll(user, query)` | `prisma.ticket.findMany` + `count` | Aplica cláusula `where` combinando o escopo do papel (`USER`, `TECHNICIAN`, `ADMIN`) com os filtros passados. Aplica paginação (`skip`, `take`). |
| `findById(id, user)` | `prisma.ticket.findUnique` | Valida a existência do chamado (`NotFoundException`) e verifica se o usuário logado tem permissão para visualizar (`ForbiddenException`). |

**Construção da Cláusula `Where` por Papel (`findAll`):**
- **`USER`**: `where.requesterId = user.id`
- **`TECHNICIAN`**: `where.OR = [{ assigneeId: null }, { assigneeId: user.id }, { requesterId: user.id }]`
- **`ADMIN`**: Sem restrição de escopo base.

**Verificação de Permissão em `findById`:**
- **`ADMIN`**: Acesso permitido.
- **`USER`**: `ticket.requesterId === user.id`.
- **`TECHNICIAN`**: `ticket.assigneeId === null || ticket.assigneeId === user.id || ticket.requesterId === user.id`.
- Se a condição for falsa: lança `ForbiddenException('Você não tem permissão para acessar este chamado')`.

**Checklist:**
- [x] Injetar `PrismaService` no `TicketsService`
- [x] Implementar validação de categoria ativa em `create`
- [x] Implementar filtro de escopo por papel em `findAll`
- [x] Implementar paginação e filtros em `findAll`
- [x] Implementar verificação de permissão granular em `findById`
- [x] Executar testes unitários em `tickets.service.spec.ts` (`npm run test tickets.service`) garantindo 100% dos testes verdes

---

### Etapa 4 — `TicketsController` (Endpoints REST e Proteção)

**Objetivo:** Expor as rotas HTTP de criação e consulta de chamados com os devidos guards de autenticação e autorização.

**Endpoints:**

| Método | Rota | Guards / Roles | Observações |
|---|---|---|---|
| `POST /tickets` | Criar chamado | `JwtAuthGuard`, `@Roles(USER, TECHNICIAN, ADMIN)` | Recebe `CreateTicketDto` e `@CurrentUser() user`. Retorna `201 Created`. |
| `GET /tickets` | Listar chamados | `JwtAuthGuard` (Todos autenticados) | Recebe `FilterTicketsDto` (Query) e `@CurrentUser() user`. Retorna `PaginatedTicketsResponse`. |
| `GET /tickets/:id` | Obter detalhe | `JwtAuthGuard` (Todos autenticados) | Recebe `:id` (Param) e `@CurrentUser() user`. Retorna `SafeTicket` ou `403`/`404`. |

**Checklist:**
- [x] Criar `TicketsController` com `@UseGuards(JwtAuthGuard, RolesGuard)`
- [x] Implementar `POST /tickets`, `GET /tickets` e `GET /tickets/:id`
- [x] Injetar `@CurrentUser()` para identificação do usuário logado
- [x] Executar testes unitários em `tickets.controller.spec.ts` (`npm run test tickets.controller`) garantindo 100% dos testes verdes

---

### Etapa 5 — Registro no `AppModule` e Validação de Suíte Geral

**Objetivo:** Conectar o `TicketsModule` na aplicação principal e validar a compilação e a suíte completa de testes do sistema.

**Checklist:**
- [ ] Criar `TicketsModule` exportando `TicketsService`
- [ ] Registrar `TicketsModule` no `imports` do `AppModule`
- [ ] Garantir build verde (`npm run build`)
- [ ] Executar suíte completa de testes unitários do backend (`npm run test`) para validar regressão zero

---

## Ordem de Execução Recomendada

```
Etapa 1 (DTOs + Check de Tipos) → Etapa 2 (Types + Check de Tipos) → Etapa 3 (TicketsService + Testes do Service) → Etapa 4 (TicketsController + Testes do Controller) → Etapa 5 (AppModule + Testes Gerais + Build)
```

---

## Critérios de Conclusão da Fase 4 (Backend)

- [ ] Qualquer usuário autenticado consegue criar um chamado, associando a uma categoria ativa.
- [ ] Tentativa de criação com categoria inexistente ou inativa retorna `400 Bad Request`.
- [ ] `USER` visualiza apenas seus próprios chamados na listagem e na consulta por ID.
- [ ] `TECHNICIAN` visualiza chamados sem responsável, seus atribuídos e seus solicitados.
- [ ] `ADMIN` visualiza todos os chamados do sistema.
- [ ] Acesso não autorizado a um chamado por ID retorna `403 Forbidden`.
- [ ] Chamado não existente retorna `404 Not Found`.
- [ ] Resposta da listagem inclui metadados de paginação e filtros funcionando.
- [ ] Dados de usuário (`requester` e `assignee`) nunca vazam `passwordHash`.
- [ ] Todos os testes unitários do `TicketsService` e `TicketsController` passando 100% verdes no final de cada etapa correspondente.
