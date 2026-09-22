# 🗺️ CHAMAdos — Roadmap Visual e do Frontend

> **Status:** Ativo e Centralizado  
> **Última atualização:** 2026-09-21  
> **Diretriz Geral:** Tema Exclusivamente Claro • Identidade Monocromática em Laranja • Base shadcn/ui + Tailwind CSS v4 • Zero Regressão Funcional (164 testes preservados).

---

## 1. Visão Geral e Filosofia

O frontend do **CHAMAdos** possui todas as regras de negócio essenciais do MVP já conectadas e cobertas por testes automatizados (autenticação JWT, gestão de usuários e categorias, abertura, ciclo de vida de chamados, comentários e auditoria).

Contudo, a interface atual apresentava um **débito visual estrutural**: utilizava um tema escuro legado, layouts provisórios sem um App Shell comum, e uma mistura de HTML cru com classes manuais em vez de componentes primitivos de design system.

Este roadmap define o plano de evolução visual do frontend, transformando o CHAMAdos em um sistema de Helpdesk/ITSM moderno, coeso e corporativo.

---

## 2. Diagnóstico do Estado Atual

| Módulo / Camada | Estado Lógico & Funcional | Estado Visual & UI | Prioridade de Refatoração |
|---|---|---|---|
| **Design Tokens & Tema** | ✅ Tailwind v4 configurado | ❌ Dark mode legado ativo em `index.css`; falta aplicar a escala monocromática clara de laranja | **P0 (Imediata)** |
| **Biblioteca de UI (`src/components/ui`)** | ⚠️ `button`, `card`, `input`, `label` instalados | ❌ Faltam `dialog`, `table`, `badge`, `select`, `textarea`, `dropdown-menu`, `skeleton`, `toast` | **P0 (Imediata)** |
| **App Shell & Layout (`src/app/layouts`)** | ⚠️ `AppLayout` apenas renderiza `<Outlet />` | ❌ Não existe Header global com identidade da marca, navegação por papéis, perfil do usuário ou logout | **P1 (Alta)** |
| **Autenticação (`src/features/auth`)** | ✅ Fluxo de login, JWT e interceptors funcionais | ⚠️ Card básico funcional mas sem a identidade visual alaranjada e refinamento de superfícies | **P1 (Alta)** |
| **Chamados (`src/features/tickets`)** | ✅ Lista, filtros, detalhes, ciclo, comentários e auditoria 100% integrados | ⚠️ Modais em `<dialog>` nativo, tabelas com classes manuais, badges sem escala unificada | **P1 (Alta)** |
| **Categorias (`src/features/categories`)** | ✅ CRUD completo e seguro via API | ⚠️ Tabela e modais usam marcação crua sem os primitivos do shadcn | **P2 (Média)** |
| **Usuários (`src/features/users`)** | ✅ CRUD e controle de papéis funcionais | ⚠️ Tabela e modais usam marcação crua | **P2 (Média)** |
| **Feedback & Loading States** | ⚠️ Spinners básicos e mensagens de erro em texto simples | ❌ Falta suporte a `Skeleton` states, empty states ilustrados e toasts padronizados | **P3 (Polimento)** |

---

## 3. Fases do Roadmap do Frontend

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 1: Fundação de Tokens e Tema Claro (Base Visual)                  │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 2: Expansão da Biblioteca de Componentes UI (shadcn/ui Primitives) │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 3: App Shell Corporativo (Header Global, Navegação e Perfil)       │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 4: Padronização Visual da Autenticação (Login)                    │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 5: Padronização Visual do Módulo de Chamados                      │
│ ├─ 5.1 Listagem, Filtros e Paginação                                   │
│ ├─ 5.2 Detalhes do Chamado e Painel de Ações                           │
│ └─ 5.3 Modais do Ciclo de Atendimento, Comentários e Auditoria         │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 6: Padronização Visual de Gestão Administrativa                   │
│ ├─ 6.1 Categorias (Tabela e Modais)                                    │
│ └─ 6.2 Usuários (Tabela e Modais)                                      │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 7: Feedback Visual, Loading States & Micro-interações             │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 8: Acessibilidade (a11y), Responsividade Mobile & Auditoria Final │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Fase 1: Fundação de Tokens e Tema Claro (Base Visual)
**Objetivo:** Substituir as diretivas e variáveis antigas de dark mode em `frontend/src/index.css` pelos novos tokens de tema exclusivamente claro e pela escala tonal de laranja.

- [x] Atualizar `:root` em `src/index.css` com as cores do [AD-001](design/AD-001-paleta-de-cores.md):
  - `--background`: `oklch(0.985 0.002 90)` (`#FAFAFA`)
  - `--foreground`: `oklch(0.18 0.01 260)` (`#18181B`)
  - `--card` / `--popover`: `oklch(1 0 0)` (`#FFFFFF`)
  - `--primary`: `oklch(0.62 0.20 40)` (`#EA580C` - Orange 600)
  - `--primary-hover`: `oklch(0.53 0.18 38)` (`#C2410C` - Orange 700)
  - `--primary-subtle`: `oklch(0.95 0.03 65)` (`#FFEDD5` - Orange 100)
  - `--border` / `--input`: `oklch(0.92 0.005 260)` (`#E4E4E7` - Zinc 200)
  - `--ring`: `oklch(0.62 0.20 40)` (`#EA580C`)
- [x] Mapear as variáveis no `@theme inline` do Tailwind v4 para consumo com classes utilitárias (`bg-primary`, `text-primary-foreground`, `border-border`, etc.).
- [x] Remover a variante de classe `.dark` para manter o tema estritamente claro sem comportamentos ambíguos.
- [x] Validar compilação e tipagem com `npm run build`.

---

### Fase 2: Expansão da Biblioteca de Componentes UI (`src/components/ui`)
**Objetivo:** Fornecer os blocos de construção primitivos acessíveis e estilizados segundo a nova escala de laranja e superfícies neutras.

- [ ] **`badge.tsx`:** Suporte a variantes:
  - `default`: Fundo Laranja suave (`bg-orange-100 text-orange-900 border-orange-200`) com dot animado.
  - `secondary`: Fundo neutro suave (`bg-zinc-100 text-zinc-800 border-zinc-200`).
  - `outline`: Borda neutra com fundo transparente.
  - `destructive`: Vermelho sutil para prioridade urgente ou falhas (`bg-red-100 text-red-800 border-red-200`).
- [ ] **`dialog.tsx`:** Modal base com backdrop blur suave (`bg-black/40 backdrop-blur-xs`), card centralizado em branco puro, header com título semântico, corpo espaçado e footer com botões de ação à direita.
- [ ] **`table.tsx`:** Componentes semânticos (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`), com cabeçalho em cinza suave (`#F9FAFB`), bordas finas e hover agradável nas linhas.
- [ ] **`select.tsx`** e **`textarea.tsx`:** Controles com visual idêntico ao `Input`, altura padronizada (`h-9` para select) e anel de foco em laranja.
- [ ] **`dropdown-menu.tsx`:** Menu contextual acessível para ações de tabela e menu de perfil.
- [ ] **`skeleton.tsx`:** Retângulos pulsantes em cinza neutro para carregamento fluido.

---

### Fase 3: App Shell Corporativo (Layout Global & Navegação)
**Objetivo:** Criar a moldura da aplicação que une todas as páginas com identidade visual coesa, navegação e controle de perfil.

- [ ] Construir o componente `AppHeader`:
  - **Identidade da Marca:** Logo do CHAMAdos com ícone de chama/ticket em laranja e tipografia com peso e clareza.
  - **Barra de Navegação Central/Superior:**
    - "Chamados" (acessível para todos os perfis autenticados).
    - "Categorias" (visível apenas para `ADMIN`).
    - "Usuários" (visível apenas para `ADMIN`).
    - Indicador de rota ativa com texto na cor primária ou barra de destaque sutil.
  - **Card de Perfil / Ações de Sessão:**
    - Nome do usuário logado e email truncado.
    - Badge de papel (`ADMIN`, `TECNICO`, `USUARIO`).
    - Botão de logout com ícone discreto e feedback imediato.
- [ ] Atualizar [src/app/layouts/AppLayout.tsx](file:///home/ferreito/Sistema%20de%20chamados/frontend/src/app/layouts/AppLayout.tsx) para incluir o `AppHeader`, área de conteúdo centralizada (`max-w-7xl mx-auto px-4 py-8`) e background neutro claro (`bg-background`).
- [ ] Garantir que a tela de login (`/login`) não renderize o Header corporativo.

---

### Fase 4: Padronização Visual da Autenticação (`src/features/auth`)
**Objetivo:** Modernizar a experiência da tela de login alinhando-a à identidade monocromática em laranja.

- [ ] Refinar [src/features/auth/pages/LoginPage.tsx](file:///home/ferreito/Sistema%20de%20chamados/frontend/src/features/auth/pages/LoginPage.tsx):
  - Card centralizado com borda neutra nítida (`border-border`), fundo branco puro (`bg-card`) e sombra sutil.
  - Título CHAMAdos com ícone e destaque primário em laranja.
  - Inputs de email e senha com estados de validação e foco em laranja.
  - Botão CTA em laranja sólido com transição para `primary-hover`.
  - Tratamento de erro com alerta padronizado em tom suave de erro (`bg-red-50 text-red-700 border-red-200`).
- [ ] Validar testes unitários existentes de autenticação.

---

### Fase 5: Padronização Visual do Módulo de Chamados (`src/features/tickets`)
**Objetivo:** Elevar o nível estético do módulo mais importante do sistema sem quebrar regras de negócio nem seletores de teste.

#### 5.1 Listagem de Chamados e Filtros
- [ ] Refatorar `TicketsListPage.tsx`:
  - Cabeçalho de página com título `text-2xl font-bold`, descrição e botão primário `+ Abrir Chamado` em destaque.
  - Barra de filtros (`TicketFilterBar`) encapsulada em card branco com inputs/selects alinhados no grid de 8px e botão "Limpar filtros".
  - Tabela (`TicketTable`) utilizando os primitivos `Table`, com alinhamento visual de colunas, espaçamento agradável (`py-3 px-4`) e botões de ação em variante `ghost` ou `outline`.
  - Unificar badges de status (`TicketStatusBadge`) e prioridade (`TicketPriorityBadge`) com a nova escala de cores.
  - Controles de paginação compactos com botões anteriores/próximos estilizados.

#### 5.2 Detalhes do Chamado (`TicketDetailPage.tsx`)
- [ ] Layout em 2 colunas no desktop:
  - **Coluna Principal (70%):** Título do chamado, descrição formatada, seção de comentários e histórico de auditoria.
  - **Coluna Lateral (30%):** Card de metadados (solicitante, técnico responsável, data de abertura, última atualização, status atual, prioridade) e ações contextuais (`TicketActionsBar`).
- [ ] Barra de Ações: Botões contextuais por papel ("Assumir Chamado", "Resolver", "Encerrar", "Reabrir") com variantes adequadas (primário, secundário ou destrutivo).

#### 5.3 Modais de Atendimento, Comentários e Auditoria
- [ ] Migrar modais (`CreateTicketModal`, `AssignTicketModal`, `ResolveTicketModal`, `CloseTicketModal`, `ReopenTicketModal`) para o primitivo `Dialog` do shadcn/ui.
- [ ] Estilizar `TicketCommentsSection`: Balões de conversa limpos, separação clara entre autor e mensagem, campo de novo comentário com textarea e botão de envio em laranja.
- [ ] Estilizar `TicketAuditSection`: Timeline vertical limpa com ícones de eventos e timestamps relativos.

---

### Fase 6: Padronização Visual de Gestão Administrativa
**Objetivo:** Padronizar as telas de gestão restritas a Administradores.

#### 6.1 Módulo de Categorias (`src/features/categories`)
- [ ] Refatorar `CategoriesPage.tsx` e `CategoryTable.tsx` utilizando `Table` e badges padronizadas (`CategoryStatusBadge`).
- [ ] Atualizar modais `CreateCategoryModal`, `EditCategoryModal` e `DeactivateCategoryDialog` com `Dialog`.

#### 6.2 Módulo de Usuários (`src/features/users`)
- [ ] Refatorar `UsersPage.tsx` e `UserTable.tsx` com `Table` e badges de papel (`UserRoleBadge` - ADMIN, ATTENDANT, USER) e status (`UserStatusBadge`).
- [ ] Atualizar modais `CreateUserModal`, `EditUserModal` e `DeactivateUserDialog` com `Dialog`.

---

### Fase 7: Feedback Visual, Estados de Carregamento & Micro-interações
**Objetivo:** Evitar telas em branco e flashes de conteúdo com estados de carregamento elegantes.

- [ ] Implementar `Skeleton` para a tabela de tickets, detalhes do ticket e painéis de dados.
- [ ] Criar componentes de Empty State ("Nenhum chamado encontrado", "Nenhum comentário registrado") com ilustrações ou ícones Lucide contextuais e texto orientador.
- [ ] Feedback em ações assíncronas: desabilitar botões com spinner e texto indicativo (ex: "Salvando...", "Criando...").

---

### Fase 8: Acessibilidade (a11y), Responsividade & Auditoria Final
**Objetivo:** Garantir conformidade com os mais altos padrões de usabilidade e integridade do código.

- [ ] **Contraste WCAG 2.1 AA:** Validar contraste de todos os textos, botões e badges sobre superfícies brancas e neutras.
- [ ] **Navegação por Teclado:** Foco visível com anel em laranja (`focus-visible:ring-primary/25`) em todos os elementos interativos.
- [ ] **Responsividade:** Ajuste fluido em breakpoints móveis (tabelas com scroll horizontal limpo, colunas empilhadas no detalhe do chamado, botões com área de toque de 44px+).
- [ ] **Auditoria de Testes e Build:**
  - `npm run build` verde sem warnings.
  - `npm run test:run` com 100% de aprovação em todos os 33 arquivos de teste (164 testes).

---

## 4. Matriz de Rastreabilidade com o Roadmap Geral (`docs/ROADMAP.md`)

| Fase do Roadmap Geral | Correspondência no Frontend Roadmap | Status Atual |
|---|---|---|
| **Fase 1 — Autenticação** | Fase 4 (Login Page UI) | Funcionalidade completa; pendente padronização visual clara. |
| **Fase 2 — Usuários** | Fase 6.2 (Users Module UI) | Funcionalidade completa; pendente migração para `Table` e `Dialog`. |
| **Fase 3 — Categorias** | Fase 6.1 (Categories Module UI) | Funcionalidade completa; pendente migração para `Table` e `Dialog`. |
| **Fase 4 — Tickets (núcleo)** | Fase 5.1 (Tickets List UI) | Funcionalidade completa; pendente nova tabela, badges e filtros. |
| **Fase 5 — Ciclo de Atendimento** | Fase 5.2 e 5.3 (Ticket Actions & Modals) | Funcionalidade completa; pendente migração para `Dialog`. |
| **Fase 6 — Comentários** | Fase 5.3 (Comments Section UI) | Funcionalidade completa; pendente visual de balões e timeline. |
| **Fase 7 — Auditoria** | Fase 5.3 (Audit Section UI) | Funcionalidade completa; pendente timeline de auditoria. |
| **Fase 8 — Frontend Geral** | Fases 1, 2, 3, 7 e 8 (App Shell, Design System, a11y) | Em execução neste roadmap. |
