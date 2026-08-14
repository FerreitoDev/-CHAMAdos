# 🔥 CHAMAdos — Roadmap de Desenvolvimento

> Última atualização: 2026-08-14
> Baseado na análise do estado atual do repositório.

---

## Estado atual

### ✅ Concluído

**Backend**
- Scaffold NestJS com ConfigModule global
- PrismaService e PrismaModule (global)
- Schema Prisma completo: `User`, `Category`, `Ticket`, `Comment`, `Audit`, `Notification`, `SystemSettings`
- Enums definidos: `UserRole`, `TicketStatus`, `TicketPriority`
- Migrations criadas e funcionando
- Docker Compose com PostgreSQL
- UsersModule scaffold (controller e service vazios)

**Frontend**
- React 19 + Vite 8 + TypeScript 6
- Tailwind CSS 4 + shadcn/ui configurados
- Design system: tokens de cor, tipografia Inter, dark mode padrão
- Roteamento base com React Router 8 (AppLayout, AppProviders, router)
- Arquitetura feature-based definida (estrutura de pastas criada)
- Infraestrutura de testes: Vitest + Testing Library + jsdom

**Documentação**
- Arquitetura de domínio (ARCHITECTURE.md)
- Decisões arquiteturais (ADs) para backend e frontend
- Design system documentado

### 🚧 Parcialmente implementado

- `users/` — módulo criado mas sem nenhuma lógica de negócio
- `frontend/src/features/` — pasta criada, sem features dentro
- `frontend/src/components/ui/` — pasta criada, sem componentes

### ❌ Não existe

Tudo relacionado a autenticação, lógica de negócio, API, telas, autorização e testes.

---

## Visão geral das fases

```text
Fase 1 — Autenticação              [MVP] Fundação de segurança
Fase 2 — Usuários                  [MVP] CRUD de usuários pelo ADMIN
Fase 3 — Categorias                [MVP] Gestão de categorias
Fase 4 — Tickets (núcleo)          [MVP] Abertura e consulta de chamados
Fase 5 — Ciclo de atendimento      [MVP] Fluxo completo de um chamado
Fase 6 — Comentários               [MVP] Comunicação em chamados
Fase 7 — Auditoria                 [MVP] Rastreabilidade obrigatória
Fase 8 — Frontend (telas)          [MVP] Interface funcional
Fase 9 — Notificações              [Pós-MVP] Notificações internas
Fase 10 — Relatórios               [Pós-MVP] Painel administrativo
Fase 11 — Configurações            [Pós-MVP] SystemSettings
Fase 12 — Qualidade e estabilidade [Futuro] Cobertura de testes ampla
```

---

## Roadmap Detalhado

---

### Fase 1 — Autenticação `[MVP]`

**Objetivo:** Proteger a API com autenticação JWT e expor endpoints de login e token refresh.

**Decisões pendentes:**
- [ ] Estratégia de refresh token: cookie HttpOnly vs. body da resposta?
- [ ] Expiração do access token (sugestão: 15min) e refresh token (sugestão: 7d)?
- [ ] Hash de senha: bcrypt (padrão) ou argon2?

**Tarefas — Backend**
- [ ] Instalar `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
- [ ] Criar `AuthModule` com `AuthService` e `AuthController`
- [ ] Implementar `POST /auth/login` → retorna access token (+ refresh token se decidido)
- [ ] Implementar `JwtStrategy` (passport) para validar o token
- [ ] Criar `JwtAuthGuard` para proteger rotas
- [ ] Criar `CurrentUser` decorator para extrair o usuário do token
- [ ] Implementar `POST /auth/refresh` (se refresh token for adotado)
- [ ] Teste unitário: `AuthService` (login com senha válida, senha inválida, usuário inexistente)

**Tarefas — Frontend**
- [ ] Criar `features/auth/` com página de login
- [ ] Formulário de login com validação
- [ ] Armazenar token (localStorage ou cookie — **decisão pendente**)
- [ ] Interceptor HTTP para enviar Authorization header
- [ ] Interceptor HTTP para redirecionar ao login em 401
- [ ] Rota protegida: redirecionar não autenticados para `/login`

**Dependências:** Nenhuma.

**Critério de conclusão:**
- Usuário faz login com email/senha e recebe token válido.
- Rota protegida retorna 401 sem token.
- Rota protegida retorna dados com token válido.
- Testes unitários do AuthService passando.

---

### Fase 2 — Usuários `[MVP]`

**Objetivo:** Permitir que ADMINs gerenciem usuários do sistema.

**Tarefas — Backend**
- [ ] Implementar `UsersService`:
  - `create(dto)` — criar usuário (hash de senha)
  - `findAll(filters?)` — listar usuários com paginação
  - `findById(id)` — buscar por ID
  - `findByEmail(email)` — buscar por email (uso interno da auth)
  - `update(id, dto)` — atualizar nome, role
  - `deactivate(id)` — soft delete (active = false)
- [ ] Criar DTOs com `class-validator`: `CreateUserDto`, `UpdateUserDto`
- [ ] Implementar `UsersController` com endpoints REST:
  - `POST /users` (ADMIN)
  - `GET /users` (ADMIN)
  - `GET /users/:id` (ADMIN ou próprio usuário)
  - `PATCH /users/:id` (ADMIN)
  - `DELETE /users/:id` → desativação (ADMIN)
- [ ] Criar `RolesGuard` para autorização baseada em papel
- [ ] Criar `@Roles()` decorator
- [ ] Validação global: `ValidationPipe` no bootstrap
- [ ] Teste unitário: `UsersService` (criar, buscar, atualizar, desativar)

**Tarefas — Frontend**
- [ ] Criar `features/users/` com listagem de usuários
- [ ] Tabela de usuários com role, status e ações
- [ ] Formulário de criação de usuário
- [ ] Formulário de edição de usuário
- [ ] Ação de desativação com confirmação

**Dependências:** Fase 1 (autenticação + guards).

**Critério de conclusão:**
- ADMIN cria, edita e desativa usuários via API.
- Usuário não-ADMIN recebe 403 ao tentar acessar endpoints de usuários.
- Senha nunca retorna na resposta da API.

---

### Fase 3 — Categorias `[MVP]`

**Objetivo:** ADMINs gerenciam categorias usadas para classificar chamados.

**Tarefas — Backend**
- [ ] Criar `CategoriesModule`, `CategoriesService`, `CategoriesController`
- [ ] Endpoints:
  - `POST /categories` (ADMIN)
  - `GET /categories` (autenticado — retorna apenas ativas por padrão)
  - `GET /categories/:id` (autenticado)
  - `PATCH /categories/:id` (ADMIN)
  - `DELETE /categories/:id` → desativação lógica (ADMIN) — rejeitar se não houver tickets vinculados? **decisão pendente**
- [ ] Seed de categorias iniciais (Hardware, Software, Rede, Acesso, E-mail, Impressora, Outros)
- [ ] Teste unitário: `CategoriesService`

**Tarefas — Frontend**
- [ ] Criar `features/categories/` (tela de admin)
- [ ] Listagem de categorias (ativas e inativas)
- [ ] Formulário de criação/edição
- [ ] Ação de desativar

**Dependências:** Fase 1, Fase 2 (guards de role).

**Critério de conclusão:**
- Seed de categorias executa na migration ou no bootstrap.
- ADMIN gerencia categorias.
- Categoria com tickets vinculados não pode ser excluída fisicamente.

---

### Fase 4 — Tickets (núcleo) `[MVP]`

**Objetivo:** Usuários criam chamados e qualquer papel pode consultá-los conforme sua permissão.

**Tarefas — Backend**
- [ ] Criar `TicketsModule`, `TicketsService`, `TicketsController`
- [ ] `POST /tickets` (USER, TECHNICIAN) — cria chamado em OPEN
- [ ] `GET /tickets` (autenticado) — listagem com filtros e paginação:
  - USER: apenas seus chamados
  - TECHNICIAN: chamados disponíveis + seus chamados
  - ADMIN: todos os chamados
- [ ] `GET /tickets/:id` — detalhe com permissão verificada
- [ ] DTOs: `CreateTicketDto` (title, description, priority, categoryId)
- [ ] Filtros na listagem: status, priority, categoryId, assigneeId (query params)
- [ ] Teste unitário: criação, listagem por papel, detalhe

**Tarefas — Frontend**
- [ ] Criar `features/tickets/`
- [ ] Página de listagem de chamados (com filtros básicos)
- [ ] Página de detalhe do chamado
- [ ] Formulário de criação de chamado

**Dependências:** Fase 1, 2, 3.

**Critério de conclusão:**
- USER abre chamado e o vê na listagem.
- TECHNICIAN vê chamados disponíveis.
- ADMIN vê todos os chamados.
- Listagem com paginação funcional.

---

### Fase 5 — Ciclo de atendimento `[MVP]`

**Objetivo:** Implementar o fluxo completo de atendimento de um chamado (transições de estado, atribuição, resolução, encerramento, reabertura).

**Decisões pendentes:**
- [ ] Quando um técnico assume um chamado, o status muda automaticamente para IN_PROGRESS ou é uma ação separada?
  - Decisão atual na doc: muda para IN_PROGRESS na atribuição.

**Tarefas — Backend**
- [ ] `PATCH /tickets/:id/assign` (TECHNICIAN assume; ADMIN atribui a outro)
- [ ] `PATCH /tickets/:id/reassign` (ADMIN reatribui a outro técnico)
- [ ] `PATCH /tickets/:id/resolve` (TECHNICIAN responsável)
- [ ] `PATCH /tickets/:id/close` (ADMIN)
- [ ] `PATCH /tickets/:id/reopen` (USER solicitante, ADMIN)
- [ ] Validar transições de estado (máquina de estados)
- [ ] Verificar `allowTechnicianSelfAssignment` ao assumir chamado
- [ ] Registrar evento na Auditoria em cada transição relevante
- [ ] Teste unitário: cada transição válida e inválida

**Tarefas — Frontend**
- [ ] Botão "Assumir chamado" (TECHNICIAN)
- [ ] Botão "Resolver" com campo de comentário obrigatório
- [ ] Botão "Encerrar" (ADMIN)
- [ ] Botão "Reabrir" com campo de comentário obrigatório
- [ ] Exibir status atual com badge visual

**Dependências:** Fase 4, Fase 7 (Auditoria precisa existir para ser chamada).

**Critério de conclusão:**
- Chamado percorre o ciclo completo: OPEN → IN_PROGRESS → RESOLVED → CLOSED.
- Transições inválidas retornam 422 com mensagem clara.
- Toda transição gera registro de auditoria.
- Permissões por papel aplicadas corretamente em cada endpoint.

---

### Fase 6 — Comentários `[MVP]`

**Objetivo:** Usuários e técnicos comentam em chamados para comunicação durante o atendimento.

**Tarefas — Backend**
- [ ] Criar `CommentsModule`, `CommentsService`, `CommentsController`
- [ ] `POST /tickets/:id/comments` (USER solicitante, TECHNICIAN responsável, ADMIN)
- [ ] `GET /tickets/:id/comments` (autenticado, com permissão ao ticket)
- [ ] Validar que apenas participantes do chamado podem comentar (ou ADMIN)
- [ ] Teste unitário: criar e listar comentários

**Tarefas — Frontend**
- [ ] Seção de comentários na página de detalhe do ticket
- [ ] Input de novo comentário
- [ ] Exibir autor, data e conteúdo de cada comentário

**Dependências:** Fase 4.

**Critério de conclusão:**
- Solicitante e técnico comentam no mesmo chamado.
- Usuário sem acesso ao chamado recebe 403.
- Comentários são exibidos em ordem cronológica.

---

### Fase 7 — Auditoria `[MVP]`

**Objetivo:** Registrar automaticamente ações relevantes para rastreabilidade.

**Tarefas — Backend**
- [ ] Criar `AuditService` (sem controller — não expõe endpoint de escrita)
- [ ] `GET /tickets/:id/audit` (ADMIN e TECHNICIAN responsável)
- [ ] `AuditService.log(action, ticketId?, actorId?, data?)` — método interno chamado por outros serviços
- [ ] Ações a registrar:
  - Ticket criado
  - Status alterado (de → para)
  - Responsável atribuído / alterado
  - Ticket resolvido
  - Ticket encerrado
  - Ticket reaberto
- [ ] Teste unitário: verificar que cada ação gera o registro correto

**Tarefas — Frontend**
- [ ] Seção de histórico de auditoria no detalhe do ticket (ADMIN/TECHNICIAN)
- [ ] Exibir: ação, ator, data

**Dependências:** Fase 4, 5 (auditoria é invocada durante o ciclo de atendimento).

**Critério de conclusão:**
- Todas as transições de estado geram registro de auditoria.
- ADMIN visualiza o histórico completo de um chamado.

---

### Fase 8 — Frontend (telas e integração) `[MVP]`

**Objetivo:** Interface funcional cobrindo todos os fluxos do MVP com autenticação integrada.

> Esta fase pode ser desenvolvida em paralelo com as fases 2–7, entregando cada tela conforme o respectivo módulo do backend fica pronto.

**Tarefas**
- [ ] Layout principal: sidebar com navegação por papel
- [ ] Roteamento protegido por papel (redirecionar para tela adequada após login)
- [ ] Página de perfil do usuário logado
- [ ] Integração com API (client HTTP centralizado, tipagem dos endpoints)
- [ ] Tratamento de erros global (toast ou alert para erros de API)
- [ ] Estado de carregamento (loading states) nas operações assíncronas
- [ ] Responsividade básica (funcional em desktop)

**Dependências:** Fases 1–7.

**Critério de conclusão:**
- Todos os fluxos do MVP são realizáveis pela interface sem necessidade de usar a API diretamente.
- Erros da API são exibidos de forma compreensível para o usuário.

---

### Fase 9 — Notificações `[Pós-MVP]`

**Objetivo:** Informar usuários sobre eventos relevantes via notificações internas.

**Decisões pendentes:**
- [ ] Mecanismo de entrega: polling periódico (simples) ou WebSocket (tempo real)?

**Tarefas — Backend**
- [ ] Criar `NotificationsService` com método `notify(recipientId, type, ticketId?)`
- [ ] `GET /notifications` — listar notificações do usuário logado
- [ ] `PATCH /notifications/:id/read` — marcar como lida
- [ ] `PATCH /notifications/read-all` — marcar todas como lidas
- [ ] Invocar `NotificationsService` nos eventos mapeados na ARCHITECTURE.md
- [ ] Teste unitário: geração de notificações por evento

**Tarefas — Frontend**
- [ ] Ícone de sino no header com badge de não lidas
- [ ] Dropdown ou página de notificações
- [ ] Ação de marcar como lida

**Dependências:** Fases 4, 5 (eventos de ticket).

---

### Fase 10 — Relatórios `[Pós-MVP]`

**Objetivo:** Fornecer métricas agregadas para administradores.

**Decisões pendentes:**
- [ ] Quais métricas são prioritárias? (ver ARCHITECTURE.md: chamados por técnico, por período, por status, por categoria, por prioridade)
- [ ] As queries serão diretas no banco ou haverá cache?

**Tarefas — Backend**
- [ ] `GET /reports/summary` — métricas gerais (contagem por status, prioridade, categoria)
- [ ] `GET /reports/by-technician` — chamados por técnico
- [ ] Filtro por período nos endpoints de relatório
- [ ] Teste: validar que as contagens estão corretas

**Tarefas — Frontend**
- [ ] Página de relatórios (ADMIN)
- [ ] Cards de métricas e tabelas simples
- [ ] Filtro por período

**Dependências:** Fase 4, 5.

---

### Fase 11 — Configurações do sistema `[Pós-MVP]`

**Objetivo:** Permitir que ADMINs controlem comportamentos do sistema (ex: autoatribuição).

**Tarefas — Backend**
- [ ] `GET /settings` (ADMIN)
- [ ] `PATCH /settings` (ADMIN) — atualizar `allowTechnicianSelfAssignment`
- [ ] Usar o valor de `allowTechnicianSelfAssignment` na Fase 5 ao verificar atribuição de técnico
- [ ] Garantir que exista sempre exatamente um registro de `SystemSettings` (seed na migration)

**Tarefas — Frontend**
- [ ] Página de configurações (ADMIN)
- [ ] Toggle de autoatribuição de técnicos

**Dependências:** Fase 5 (allowTechnicianSelfAssignment afeta o fluxo de atribuição).

---

### Fase 12 — Qualidade e estabilidade `[Futuro]`

**Objetivo:** Elevar cobertura de testes, adicionar testes e2e e estabilizar o sistema para uso real.

**Tarefas**
- [ ] Testes e2e do fluxo completo de um chamado (supertest)
- [ ] Cobertura de testes unitários > 80% nos services de domínio
- [ ] Testes de integração frontend (Testing Library) para fluxos críticos
- [ ] Revisão de performance: queries N+1 no Prisma
- [ ] Revisão de segurança: validação de inputs, rate limiting, CORS restritivo
- [ ] Documentação OpenAPI (Swagger) dos endpoints

**Dependências:** Todas as fases do MVP.

---

## Dependências críticas

```text
Auth (F1) ──────────────────────────────────────────► TODAS as demais fases
Users (F2) ──────────────────────────────────────────► Tickets, Categorias
Categorias (F3) ─────────────────────────────────────► Tickets
Tickets/núcleo (F4) ─────────────────────────────────► Ciclo, Comentários, Auditoria
Ciclo de atendimento (F5) + Auditoria (F7) ──────────► Frontend completo (F8)
Comentários (F6) ────────────────────────────────────► Frontend completo (F8)
```

---

## Decisões técnicas pendentes

| # | Decisão | Impacto | Fase |
|---|---|---|---|
| D-1 | Estratégia de refresh token (cookie HttpOnly vs. body) | Segurança, UX | F1 |
| D-2 | Hash de senha: bcrypt ou argon2 | Segurança | F1 |
| D-3 | Armazenamento do token no frontend (localStorage vs. cookie) | Segurança, CSRF | F1 |
| D-4 | Ao assumir chamado, status muda automaticamente para IN_PROGRESS? | Fluxo de negócio | F5 |
| D-5 | Desativar categoria que tem tickets vinculados: permitir ou bloquear? | Integridade de dados | F3 |
| D-6 | Notificações: polling ou WebSocket? | Arquitetura, complexidade | F9 |
| D-7 | Paginação: cursor-based ou offset? | Performance | F4 |
| D-8 | Quais relatórios são prioritários no pós-MVP? | Escopo | F10 |

---

## Definição de MVP concluído

O MVP está concluído quando:

1. Um usuário consegue se autenticar com email e senha.
2. Um ADMIN consegue criar e gerenciar usuários e categorias.
3. Um USER consegue abrir um chamado com título, descrição, prioridade e categoria.
4. Um TECHNICIAN consegue ver chamados disponíveis, assumir um chamado e resolver aplicando a finalização.
5. Um ADMIN consegue encerrar chamados resolvidos.
6. Um USER ou ADMIN consegue reabrir chamados com comentário explicativo.
7. Partes interessadas podem comentar no chamado durante o atendimento.
8. Toda transição de estado gera registro de auditoria consultável.
9. A interface cobre todos os fluxos acima sem necessidade de acesso direto à API.
10. Permissões por papel são aplicadas corretamente em toda a API.

---

## Referências

- [ARCHITECTURE.md](ARCHITECTURE.md) — domínio, regras de negócio, ciclo de vida dos chamados
- [backend/README.md](../backend/README.md) — setup e comandos do backend
- [frontend/README.md](../frontend/README.md) — setup e comandos do frontend
- [backend/decisions/](backend/decisions/) — decisões arquiteturais do backend
- [frontend/decisions/](frontend/decisions/) — decisões arquiteturais do frontend
