# Planejamento Técnico — Fase 1 Frontend: Autenticação

Este documento descreve as etapas de implementação da autenticação no frontend do CHAMAdos. Cada etapa é independente e pode ser comitada separadamente.

O backend da Fase 1 está **100% implementado**:
- `POST /auth/login` → body `{ accessToken }` + cookie HttpOnly `refreshToken`
- `POST /auth/refresh` → body `{ accessToken }`
- `POST /auth/logout` → 204, limpa cookie

---

## Contexto da fundação atual

O frontend possui:
- React Router 8 com `AppLayout`, `AppProviders` e `router` configurados
- `main.tsx` montando `AppProviders > RouterProvider`
- `features/` vazia, pronta para receber domínios
- `shared/` vazia, pronta para utilitários
- Design system em `index.css` (dark mode, laranja queimado, Inter Variable)

**Dependências relevantes disponíveis no `package.json`:**
- `react-router` — roteamento
- `shadcn/ui` + `@base-ui/react` — componentes
- `lucide-react` — ícones

**⚠️ Ainda não instalado:**
- `axios` ou `ky` — cliente HTTP (a ser decidido na Etapa 1)

---

## Etapas

---

### Etapa 1 — Cliente HTTP e tipos da API de auth

**Objetivo:** Centralizar toda comunicação com a API em um único módulo, com tipagem estrita dos contratos de auth.

**Arquivos a criar:**
```
src/shared/api/
├── client.ts          # instância axios/ky com baseURL e interceptadores base
└── auth.api.ts        # funções: login(dto), refresh(), logout()
```

**Contrato da API:**
```typescript
// Entrada
interface LoginDto {
  email: string
  password: string
}

// Saída de login e refresh
interface AuthTokens {
  accessToken: string
}
```

**Decisão pendente:** `axios` vs `ky`
- `axios` — amplamente conhecido, interceptors maduros
- `ky` — moderno, baseado em fetch, menor bundle
- **Recomendação:** `axios` pela maturidade dos interceptors (necessários na Etapa 3)

**Comportamento do cliente:**
- `baseURL` lida de `import.meta.env.VITE_API_URL`
- `withCredentials: true` em toda instância (necessário para o cookie de refresh token funcionar)
- Sem interceptors de token ainda (serão adicionados na Etapa 3)

**Testes:** não obrigatórios nesta etapa (funções puras de API são cobertas por testes de integração/e2e)

**Checklist:**
- [x] Instalar `axios`
- [x] Criar `.env.local` com `VITE_API_URL=http://localhost:3000`
- [x] Criar `src/shared/api/client.ts`
- [x] Criar `src/shared/api/auth.api.ts`

---

### Etapa 2 — Estado global de autenticação (`AuthContext`)

**Objetivo:** Armazenar o `accessToken` e as informações do usuário logado em memória (não localStorage — por segurança). Expor as ações de login e logout para toda a aplicação.

**Arquivos a criar:**
```
src/features/auth/
├── auth.context.tsx   # createContext + AuthProvider
├── auth.types.ts      # AuthState, AuthUser, AuthContextValue
└── use-auth.ts        # hook useAuth() — acesso ao contexto
```

**Estado do contexto:**
```typescript
interface AuthUser {
  id: string
  email: string
  role: 'USER' | 'TECHNICIAN' | 'ADMIN'
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean          // true durante a verificação inicial (tentativa de refresh)
  login: (dto: LoginDto) => Promise<void>
  logout: () => Promise<void>
}
```

**Comportamento do `AuthProvider` na montagem:**
- Ao montar, tentar `POST /auth/refresh` automaticamente
- Se retornar `accessToken` → decodificar o payload JWT (sem validar assinatura — apenas ler `sub`, `email`, `role`) e popular o estado
- Se retornar erro → usuário não autenticado (`user = null`)
- Isso garante que usuários com sessão ativa não precisam fazer login novamente ao recarregar

**Integração:**
- `AuthProvider` será adicionado dentro de `AppProviders.tsx`

**Checklist:**
- [x] Criar `auth.types.ts`
- [x] Criar `auth.context.tsx` com `AuthProvider` e lógica de hidratação
- [x] Criar `use-auth.ts`
- [x] Registrar `AuthProvider` em `AppProviders.tsx`

---

### Etapa 3 — Interceptors HTTP

**Objetivo:** Automatizar o envio do `accessToken` em toda requisição e renovar o token silenciosamente quando o backend retornar 401.

**Arquivo a alterar:** `src/shared/api/client.ts`

**Interceptor de request:**
```
Toda requisição → adiciona header: Authorization: Bearer <accessToken>
```

**Interceptor de response (refresh silencioso):**
```
Recebe 401 →
  1. Tenta POST /auth/refresh
  2. Se sucesso → atualiza o accessToken no AuthContext e reprocessa a requisição original
  3. Se falhar → limpa o AuthContext e redireciona para /login
```

**Desafio técnico:** O interceptor de axios precisa de acesso ao `accessToken` do `AuthContext`, mas o contexto é React e o axios não tem acesso direto.

**Solução planejada:** Módulo `token-store.ts` — objeto singleton mutável que o `AuthProvider` atualiza e os interceptors leem. Isola o axios do React sem criar acoplamento circular.

```
src/shared/api/token-store.ts   # { get, set, clear } — simples singleton em memória
```

**Checklist:**
- [x] Criar `token-store.ts`
- [x] Implementar interceptor de request no `client.ts`
- [x] Implementar interceptor de response com refresh silencioso
- [x] Atualizar `AuthProvider` para chamar `tokenStore.set` e `tokenStore.clear`

---

### Etapa 4 — Página de login

**Objetivo:** Tela de login do usuário com formulário validado.

**Arquivos a criar:**
```
src/features/auth/
└── pages/
    └── LoginPage.tsx
```

**Comportamento:**
- Campos: `email` e `password`
- Validação: email válido, senha não vazia (sem biblioteca de formulário por ora — validação nativa ou simples `state`)
- Submit → chama `useAuth().login(dto)`
- Em caso de sucesso → redirecionamento para `/` (feito dentro do `AuthProvider.login`)
- Em caso de erro → exibir mensagem genérica: "Credenciais inválidas"
- **Se usuário já estiver autenticado (`isAuthenticated === true`)** → redirecionar para `/` imediatamente

**UI:** usar componentes shadcn/ui existentes (`Button`, `Input`, `Label`, `Card`)

**Checklist:**
- [ ] Criar `LoginPage.tsx`
- [ ] Registrar rota `/login` no `router`
- [ ] Testar fluxo completo com backend rodando

---

### Etapa 5 — Rota protegida (`ProtectedRoute`)

**Objetivo:** Impedir acesso a rotas autenticadas sem token válido.

**Arquivo a criar:**
```
src/app/router/
└── ProtectedRoute.tsx
```

**Comportamento:**
```
isLoading === true  → exibir loading spinner (aguarda verificação do refresh)
isAuthenticated === false → redirecionar para /login
isAuthenticated === true → renderizar <Outlet />
```

**Integração:**
- Envolver rotas privadas no `router` com `<ProtectedRoute>`
- Rota `/` passará a ser protegida

**Checklist:**
- [ ] Criar `ProtectedRoute.tsx`
- [ ] Aplicar na rota `/` do `router`
- [ ] Validar redirecionamento ao acessar `/` sem cookie

---

## Ordem de execução recomendada

```
Etapa 1 (cliente HTTP) → Etapa 2 (AuthContext) → Etapa 3 (interceptors) → Etapa 4 (página login) → Etapa 5 (rota protegida)
```

As etapas **1, 2 e 3** são infraestrutura. As etapas **4 e 5** são visíveis e dependem das anteriores.

---

## Checklist geral de validação

- [x] Etapa 1: cliente HTTP criado e tipado
- [x] Etapa 2: `AuthProvider` montado, hidratação automática via refresh funcionando
- [x] Etapa 3: interceptors ativos, refresh silencioso funcionando
- [ ] Etapa 4: página de login funcional integrada com o backend
- [ ] Etapa 5: rota `/` redireciona para `/login` sem cookie válido
- [ ] Critério de conclusão da Fase 1: usuário faz login, acessa rota protegida, recarrega a página e continua autenticado
