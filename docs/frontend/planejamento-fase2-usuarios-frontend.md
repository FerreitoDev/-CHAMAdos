# Planejamento Técnico — Fase 2 Frontend: Gerenciamento de Usuários

Este documento detalha as etapas de implementação do módulo de usuários no frontend do **CHAMAdos**. Cada etapa é independente, testável e pode ser comitada separadamente.

**Fundação disponível (Backend Fase 2 100% pronto):**
- `POST /users` (ADMIN) — Criar usuário (Corpo: `name`, `email`, `password`, `role?`)
- `GET /users` (ADMIN) — Listar usuários (Retorna `SafeUser[]`)
- `GET /users/:id` (ADMIN ou próprio) — Buscar perfil por ID
- `PATCH /users/:id` (ADMIN) — Atualizar usuário (Corpo: `name?`, `role?`)
- `DELETE /users/:id` (ADMIN) — Desativar usuário (`204 No Content`)

---

## Estrutura da Feature

```text
```text
src/features/users/
├── api/
│   ├── users.api.ts             # Requisições HTTP para /users
│   └── users.api.test.ts        # Testes unitários da integração HTTP
├── types/
│   └── users.types.ts           # Interfaces SafeUser, CreateUserPayload, UpdateUserPayload
├── components/
│   ├── UserRoleBadge.tsx        # Badge visual por papel (ADMIN, TECHNICIAN, USER)
│   ├── UserStatusBadge.tsx      # Badge visual de status (Ativo / Inativo)
│   ├── UserTable.tsx            # Tabela de listagem com ações
│   ├── UserTable.test.tsx       # Teste de componente da tabela e bloqueio de auto-desativação
│   ├── CreateUserModal.tsx      # Modal de formulário para criação
│   ├── CreateUserModal.test.tsx # Teste de validação e submissão do formulário
│   ├── EditUserModal.tsx        # Modal de formulário para edição
│   ├── EditUserModal.test.tsx   # Teste de edição de perfil
│   ├── DeactivateUserDialog.tsx # Modal de confirmação de desativação
│   └── DeactivateUserDialog.test.tsx # Teste de confirmação e disparo da desativação
├── pages/
│   └── UsersPage.tsx            # Tela principal da gestão de usuários
└── __tests__/
    └── UsersPage.test.tsx       # Testes de integração/componente da tela e autorização
```

---

## Etapas de Implementação

---

### Etapa 1 — Contrato da API e Tipos (`users.types.ts` e `users.api.ts`)

**Objetivo:** Definir as interfaces de domínio no frontend e expor os métodos HTTP que consomem a API de usuários via Axios.

**Arquivos a criar:**
```
src/features/users/
├── types/users.types.ts
├── api/users.api.ts
└── api/users.api.test.ts
```

**Tipos (`users.types.ts`):**
```typescript
export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
}
```

**Métodos de API (`users.api.ts`):**
- `getUsers()` → `GET /users`
- `getUserById(id: string)` → `GET /users/:id`
- `createUser(payload: CreateUserPayload)` → `POST /users`
- `updateUser(id: string, payload: UpdateUserPayload)` → `PATCH /users/:id`
- `deactivateUser(id: string)` → `DELETE /users/:id`

**Checklist:**
- [x] Criar `src/features/users/types/users.types.ts`
- [x] Criar `src/features/users/api/users.api.ts`
- [x] Garantir o uso da instância centralizada do Axios (`src/shared/api/client.ts`)
- [x] Testes unitários da API (`src/features/users/api/users.api.test.ts`)

---

### Etapa 2 — Componentes visuais (`UserRoleBadge`, `UserStatusBadge` e `UserTable`)

**Objetivo:** Criar os componentes puramente visuais para renderização de papéis, status e a tabela de listagem de usuários.

**Arquivos a criar:**
```
src/features/users/components/
├── UserRoleBadge.tsx
├── UserStatusBadge.tsx
├── UserTable.tsx
└── UserTable.test.tsx
```

**Comportamento visual:**
- `UserRoleBadge`: Renderiza com cores distintas por papel (ex: ADMIN = Laranja/Amarelo, TECHNICIAN = Azul, USER = Cinza/Slated).
- `UserStatusBadge`: `Ativo` (Verde), `Inativo` (Cinza/Vermelho).
- `UserTable`: Tabela com cabeçalhos (Nome, Email, Role, Status, Data de Cadastro, Ações).
  - Ações por linha: Botão Editar e Botão Desativar.
  - Bloqueio de auto-desativação: O botão Desativar deve vir desabilitado para a linha do próprio usuário autenticado.

**Checklist:**
- [ ] Criar `UserRoleBadge.tsx`
- [ ] Criar `UserStatusBadge.tsx`
- [ ] Criar `UserTable.tsx`
- [ ] Testes unitários do componente `UserTable` (renderização e botão de desativação desabilitado para o próprio usuário logado)

---

### Etapa 3 — Modais de Formulário (`CreateUserModal` e `EditUserModal`)

**Objetivo:** Criar modais interativos para criação de novos usuários e atualização de cadastro existente (nome e papel).

**Arquivos a criar:**
```
src/features/users/components/
├── CreateUserModal.tsx
├── CreateUserModal.test.tsx
├── EditUserModal.tsx
└── EditUserModal.test.tsx
```

**Regras de Validação:**
- **Criação**: `name` obrigatório, `email` válido, `password` com no mínimo 8 caracteres, `role` selecionável (`USER`, `TECHNICIAN`, `ADMIN`).
- **Edição**: `name` obrigatório, `role` selecionável. Email e senha bloqueados/omitidos (possuem fluxos próprios).
- Tratamento de mensagens de erro amigáveis vindas da API (ex: 400 Bad Request / email duplicado).

**Checklist:**
- [ ] Criar `CreateUserModal.tsx`
- [ ] Criar `EditUserModal.tsx`
- [ ] Testes unitários/componente dos formulários (`CreateUserModal.test.tsx` e `EditUserModal.test.tsx`)

---

### Etapa 4 — Modal de Confirmação de Desativação (`DeactivateUserDialog`)

**Objetivo:** Prover confirmação visual explícita antes de executar o soft delete de um usuário.

**Arquivos a criar:**
```
src/features/users/components/
├── DeactivateUserDialog.tsx
└── DeactivateUserDialog.test.tsx
```

**Comportamento:**
- Exibe o nome do usuário a ser desativado.
- Alerta que a ação desativará o acesso do usuário ao sistema (sem exclusão física do banco).
- Dispara a chamada `deactivateUser(id)` ao confirmar.

**Checklist:**
- [ ] Criar `DeactivateUserDialog.tsx`
- [ ] Testes unitários do componente (`DeactivateUserDialog.test.tsx`)

---

### Etapa 5 — Tela Principal, Proteção de Rota e Testes (`UsersPage` & Roteamento)

**Objetivo:** Montar a tela de usuários (`UsersPage`), integrar o estado da página (busca, abertura de modais, recarregamento de lista após ações), proteger a rota `/users` no router e escrever testes de integração completos.

**Arquivos a criar/modificar:**
```
src/features/users/pages/UsersPage.tsx
src/features/users/__tests__/UsersPage.test.tsx
src/app/router.tsx  # Atualizar com a nova rota protegida por ADMIN
```

**Regras de Roteamento:**
- A rota `/users` só deve ser acessível por usuários com `role === 'ADMIN'`.
- Se um usuário comum (`USER` ou `TECHNICIAN`) tentar acessar `/users`, deve ser redirecionado para o dashboard/home com mensagem de acesso negado.

**Checklist:**
- [ ] Implementar `UsersPage.tsx`
- [ ] Registrar rota `/users` no `router.tsx` com restrição por role `ADMIN`
- [ ] Escrever testes de integração em `UsersPage.test.tsx` (Vitest + Testing Library)

---

## Critérios de conclusão da Fase 2 (Frontend)

- [ ] ADMIN visualiza a lista completa de usuários cadastrados
- [ ] ADMIN cria novos usuários com nome, email, senha e role
- [ ] ADMIN edita o nome e role de um usuário existente
- [ ] ADMIN desativa usuários com confirmação via modal
- [ ] ADMIN não consegue clicar para se auto-desativar na interface
- [ ] Usuários `USER` e `TECHNICIAN` não conseguem acessar a rota `/users`
- [ ] Suíte de testes do frontend passando 100% verde (Vitest)
