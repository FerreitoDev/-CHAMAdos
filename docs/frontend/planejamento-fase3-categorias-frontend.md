# Planejamento Técnico — Fase 3 Frontend: Gerenciamento de Categorias

Este documento detalha as etapas de implementação do módulo de categorias no frontend do **CHAMAdos**. Cada etapa foi estruturada para ser anatomicamente pequena, coesa, testável e adequada para um commit independente.

**Fundação disponível (Backend Fase 3 100% pronto):**
- `POST /categories` (ADMIN) — Criar categoria (`name`, `description?`)
- `GET /categories` (Autenticado) — Listar categorias ativas (suporta `?includeInactive=true` para ADMIN)
- `GET /categories/:id` (Autenticado) — Buscar categoria por ID
- `PATCH /categories/:id` (ADMIN) — Atualizar categoria (`name?`, `description?`, `active?`)
- `DELETE /categories/:id` (ADMIN) — Desativar categoria (`204 No Content`)

---

## Estrutura da Feature

```text
src/features/categories/
├── api/
│   ├── categories.api.ts             # Requisições HTTP via Axios client
│   └── categories.api.test.ts        # Testes unitários da integração HTTP
├── types/
│   └── categories.types.ts           # Interfaces Category, CreateCategoryPayload, UpdateCategoryPayload, GetCategoriesParams
├── components/
│   ├── CategoryStatusBadge.tsx       # Badge visual de status (Ativa / Inativa)
│   ├── CategoryTable.tsx             # Tabela de listagem com ações
│   ├── CategoryTable.test.tsx        # Testes do componente da tabela
│   ├── CreateCategoryModal.tsx       # Modal/Formulário de criação
│   ├── CreateCategoryModal.test.tsx  # Testes de validação e submissão do formulário
│   ├── EditCategoryModal.tsx         # Modal/Formulário de edição
│   ├── EditCategoryModal.test.tsx    # Testes do formulário de edição
│   ├── DeactivateCategoryDialog.tsx  # Modal de confirmação de desativação
│   └── DeactivateCategoryDialog.test.tsx # Testes de confirmação de desativação
├── pages/
│   └── CategoriesPage.tsx            # Tela principal da gestão de categorias
└── __tests__/
    └── CategoriesPage.test.tsx       # Testes de integração/componente da tela e autorização
```

---

## Etapas de Implementação

---

### Etapa 1 — Contrato da API e Tipos (`categories.types.ts` e `categories.api.ts`)

**Objetivo:** Definir as interfaces de domínio no frontend e expor os métodos HTTP que consomem a API de categorias via Axios.

**Arquivos a criar:**
```text
src/features/categories/
├── types/categories.types.ts
├── api/categories.api.ts
└── api/categories.api.test.ts
```

**Tipos (`categories.types.ts`):**
```typescript
export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface GetCategoriesParams {
  includeInactive?: boolean;
}
```

**Métodos de API (`categories.api.ts`):**
- `getCategories(params?: GetCategoriesParams)` → `GET /categories`
- `getCategoryById(id: string)` → `GET /categories/:id`
- `createCategory(payload: CreateCategoryPayload)` → `POST /categories`
- `updateCategory(id: string, payload: UpdateCategoryPayload)` → `PATCH /categories/:id`
- `deactivateCategory(id: string)` → `DELETE /categories/:id`

**Checklist:**
- [x] Criar `src/features/categories/types/categories.types.ts`
- [x] Criar `src/features/categories/api/categories.api.ts` utilizando a instância Axios (`src/shared/api/client.ts`)
- [x] Testes unitários da API (`src/features/categories/api/categories.api.test.ts`)

---

### Etapa 2 — Componentes Visuais de Exibição (`CategoryStatusBadge` e `CategoryTable`)

**Objetivo:** Criar componentes de apresentação para renderizar o status e a listagem em tabela de categorias com ações de edição e desativação.

**Arquivos a criar:**
```text
src/features/categories/components/
├── CategoryStatusBadge.tsx
├── CategoryTable.tsx
└── CategoryTable.test.tsx
```

**Comportamento visual:**
- `CategoryStatusBadge`: Renderiza `Ativa` (badge verde) e `Inativa` (badge cinza/vermelha).
- `CategoryTable`: Tabela com colunas (Nome, Descrição, Status, Data de Cadastro, Ações).
  - Coluna Ações: Botão Editar e Botão Desativar (desabilitado se a categoria já estiver inativa).

**Checklist:**
- [x] Criar `CategoryStatusBadge.tsx`
- [x] Criar `CategoryTable.tsx`
- [x] Testes unitários de componente (`CategoryTable.test.tsx`) cobrindo renderização de dados e botões de ação

---

### Etapa 3 — Modais de Formulário (`CreateCategoryModal` e `EditCategoryModal`)

**Objetivo:** Criar formulários em modais interativos para criação de novas categorias e edição de cadastro existente.

**Arquivos a criar:**
```text
src/features/categories/components/
├── CreateCategoryModal.tsx
├── CreateCategoryModal.test.tsx
├── EditCategoryModal.tsx
└── EditCategoryModal.test.tsx
```

**Regras de Validação:**
- **Criação**: Campo `name` obrigatório, `description` opcional.
- **Edição**: Campo `name` obrigatório, `description` opcional, toggle de `active`.
- Tratamento de erro 409 Conflict da API (exibe mensagem de nome de categoria duplicado).

**Checklist:**
- [ ] Criar `CreateCategoryModal.tsx`
- [ ] Criar `EditCategoryModal.tsx`
- [ ] Testes unitários/componente dos formulários (`CreateCategoryModal.test.tsx` e `EditCategoryModal.test.tsx`)

---

### Etapa 4 — Modal de Confirmação de Desativação (`DeactivateCategoryDialog`)

**Objetivo:** Prover confirmação visual explícita antes de executar a desativação lógica de uma categoria.

**Arquivos a criar:**
```text
src/features/categories/components/
├── DeactivateCategoryDialog.tsx
└── DeactivateCategoryDialog.test.tsx
```

**Comportamento:**
- Exibe o nome da categoria a ser desativada.
- Alerta que a categoria ficará indisponível para seleção em novos chamados.
- Executa `deactivateCategory(id)` ao confirmar.

**Checklist:**
- [ ] Criar `DeactivateCategoryDialog.tsx`
- [ ] Testes unitários do modal (`DeactivateCategoryDialog.test.tsx`)

---

### Etapa 5 — Tela Principal, Filtros, Proteção de Rota e Testes (`CategoriesPage` & Roteamento)

**Objetivo:** Montar a página principal (`CategoriesPage`), integrar estados (busca por nome, toggle `Exibir inativas`), gerenciar abertura de modais, proteger a rota no router e cobrir com testes de integração.

**Arquivos a criar/modificar:**
```text
src/features/categories/pages/CategoriesPage.tsx
src/features/categories/__tests__/CategoriesPage.test.tsx
src/app/router.tsx
```

**Regras de Roteamento e Acesso:**
- A rota `/categories` deve ser protegida e restrita para usuários com `role === 'ADMIN'`.
- Usuários `USER` ou `TECHNICIAN` que tentarem acessar a rota devem ser redirecionados com mensagem de acesso restrito.

**Checklist:**
- [ ] Criar `CategoriesPage.tsx`
- [ ] Registrar rota `/categories` no `router.tsx` restrita a `ADMIN`
- [ ] Testes de integração da página (`CategoriesPage.test.tsx`)

---

## Critérios de Conclusão da Fase 3 (Frontend)

- [ ] ADMIN visualiza listagem completa de categorias (ativas e inativas via filtro/toggle)
- [ ] ADMIN cria novas categorias especificando nome e descrição
- [ ] ADMIN edita nome e descrição de categorias existentes
- [ ] ADMIN desativa categorias com modal de confirmação
- [ ] Tentar cadastrar nome duplicado exibe mensagem amigável de conflito (409)
- [ ] Usuários sem papel `ADMIN` não possuem acesso à rota `/categories`
- [ ] Suíte de testes do frontend executando 100% verde
