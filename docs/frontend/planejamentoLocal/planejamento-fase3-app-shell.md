# Planejamento Técnico — Fase 3 Visual: App Shell Corporativo (Layout Global & Navegação)

> **Status:** Concluído  
> **Roadmap:** [ROADMAP do Frontend](../ROADMAP.md) — Fase 3  
> **Diretrizes:** [AD-001 — Paleta de Cores](../design/AD-001-paleta-de-cores.md) e [Design System README](../design/README.md)  
> **Objetivo:** Criar o App Shell corporativo que envolve todas as páginas autenticadas do sistema, fornecendo identidade visual unificada (CHAMAdos com chama alaranjada), navegação contextual por papel de acesso (RBAC), controle de perfil e logout imediato.

---

## 1. Contexto & Diagnóstico

Atualmente:
1. `src/app/layouts/AppLayout.tsx` apenas renderiza `<Outlet />` sem qualquer moldura visual.
2. Não existe cabeçalho global: cada página tenta renderizar títulos isolados sem barra de navegação comum.
3. Não há indicação visual de qual usuário está logado nem atalho acessível de logout no topo da tela.
4. Administradores precisam digitar URLs manualmente (`/users`, `/categories`) ou depender de links esparsos.

Com a conclusão das Fases 1 (Tokens & Tema Claro) e 2 (Biblioteca de Componentes UI: `Button`, `Badge`, `DropdownMenu`, etc.), temos toda a base necessária para estruturar o `AppHeader` e enriquecer o `AppLayout`.

---

## 2. Especificação do App Shell e Componentes

### 2.1 Componente `AppHeader` (`src/app/layouts/AppHeader.tsx`)

Estrutura visual em 3 zonas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [🔥 CHAMAdos]     [Chamados]  [Categorias*]  [Usuários*]     [email@corp.com (ADMIN) ⎋] │
│   (Marca/Home)               (Navegação RBAC)                 (Perfil & Logout)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
* Visível apenas para ADMIN
```

1. **Zona da Marca (Esquerda):**
   - Ícone de chama (`Flame` de `lucide-react`) em laranja primário com container suave (`bg-orange-100 text-primary p-1.5 rounded-lg`).
   - Logotipo textual "CHAMAdos" em `text-lg font-bold tracking-tight text-foreground`.
   - Link de navegação direcionando para `/tickets` (área principal do sistema).

2. **Zona de Navegação (Centro):**
   - Utilização de `NavLink` do `react-router` para tratamento nativo de rotas ativas.
   - Links:
     - **"Chamados"** (`/tickets`): acessível a todos os papéis (`USER`, `TECHNICIAN`, `ADMIN`).
     - **"Categorias"** (`/categories`): exibido condicionalmente para `ADMIN`.
     - **"Usuários"** (`/users`): exibido condicionalmente para `ADMIN`.
   - Estilo dos links:
     - Inativo: `text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-md transition-colors`.
     - Ativo: `text-sm font-semibold text-primary bg-orange-50 border border-orange-200/60 px-3 py-1.5 rounded-md shadow-2xs`.

3. **Zona de Perfil & Sessão (Direita):**
   - E-mail do usuário autenticado truncado em telas menores (`truncate max-w-[180px] text-sm text-foreground font-medium`).
   - `Badge` de papel estilizado com o componente criado na Fase 2:
     - `ADMIN` → `Badge variant="default"` (fundo laranja suave).
     - `TECHNICIAN` → `Badge variant="secondary"` (label amigável "Técnico").
     - `USER` → `Badge variant="outline"` (label amigável "Usuário").
   - Botão de Logout utilizando `Button variant="ghost" size="sm"` com ícone `LogOut`, texto "Sair" e feedback visual imediato ao chamar `logout()`.

### 2.2 Layout Global (`src/app/layouts/AppLayout.tsx`)

- Estrutura base da aplicação com classes utilitárias semânticas:
  - Container raiz: `min-h-screen bg-background text-foreground flex flex-col`.
  - Cabeçalho: Renderiza `<AppHeader />` quando autenticado e fora da rota `/login`.
  - Área principal: `<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <Outlet /> </main>`.
- Garantia de que telas não autenticadas (`/login`) não recebam o `AppHeader`.

---

## 3. Etapas de Execução

---

### Etapa 1 — Criação do Componente `AppHeader`

**Objetivo:** Implementar o cabeçalho global corporativo com marca, navegação RBAC e painel de sessão.

**Arquivo a criar:**
- `frontend/src/app/layouts/AppHeader.tsx`

**Ações específicas:**
1. Conectar ao contexto `useAuth()` para obter `user` e `logout`.
2. Renderizar a marca "CHAMAdos" com ícone alaranjado.
3. Renderizar navegação com `NavLink` filtrando links pelo papel (`ADMIN` vs outros).
4. Renderizar identificação do usuário, badge de papel e botão de logout.

**Checklist:**
- [x] `src/app/layouts/AppHeader.tsx` criado.
- [x] Suporte a controle de visibilidade RBAC para ADMIN (`/categories`, `/users`).
- [x] Estilo de rota ativa em laranja suave implementado.
- [x] Botão de logout integrado à função `logout()` do `useAuth`.

---

### Etapa 2 — Atualização do `AppLayout` e Isolamento da Rota de Login

**Objetivo:** Integrar o `AppHeader` à estrutura das páginas mantendo a rota `/login` limpa e isolada.

**Arquivo a modificar:**
- `frontend/src/app/layouts/AppLayout.tsx`

**Ações específicas:**
1. Inspecionar `useAuth()` e `useLocation()` em `AppLayout`.
2. Se a rota for `/login` ou se não houver usuário autenticado, renderizar apenas `<Outlet />`.
3. Se for rota autenticada, renderizar o App Shell completo com `<AppHeader />` e `<main className="max-w-7xl ...">`.

**Checklist:**
- [x] `src/app/layouts/AppLayout.tsx` atualizado com o App Shell.
- [x] Isolamento da rota `/login` sem cabeçalho confirmado.
- [x] Grid centralizado com `max-w-7xl` aplicado ao conteúdo principal.

---

### Etapa 3 — Testes Automatizados do `AppHeader`

**Objetivo:** Garantir cobertura total de testes unitários para a navegação, visibilidade por papel e ação de logout.

**Arquivo a criar:**
- `frontend/src/app/layouts/AppHeader.test.tsx`

**Cenários a cobrir:**
1. Renderização da marca "CHAMAdos" e link para `/tickets`.
2. Exibição exclusiva dos links de administração ("Categorias" e "Usuários") para usuários `ADMIN`.
3. Ocultação dos links administrativos para usuários com papel `USER` ou `TECHNICIAN`.
4. Exibição do e-mail do usuário e badge correspondente ao papel (`ADMIN`, `Técnico`, `Usuário`).
5. Disparo do método `logout` ao acionar o botão de sair.

**Checklist:**
- [x] `src/app/layouts/AppHeader.test.tsx` criado com 5+ testes unitários.
- [x] Todos os testes passando verde via `npm run test:run`.

---

### Etapa 4 — Validação de Build e Suite de Regressão

**Objetivo:** Garantir conformidade com os 164 testes já existentes do frontend e integridade no build.

**Comandos de validação:**
1. `npm run build`
2. `npm run test:run`

**Checklist:**
- [x] `npm run build` verde sem erros de tipagem.
- [x] `npm run test:run` executado com 100% de testes aprovados (169 testes).

---

## 4. Critérios de Aceitação da Fase 3

1. [x] **Identidade Visual Presente:** O logo do CHAMAdos com ícone alaranjado é exibido no topo de todas as páginas autenticadas.
2. [x] **Navegação RBAC Funcional:** Administradores têm acesso rápido a Chamados, Categorias e Usuários; Técnicos e Usuários visualizam apenas Chamados.
3. [x] **Controle de Sessão Claro:** E-mail e badge de perfil visíveis com ação de logout direta e funcional.
4. [x] **Login Isolado:** A página de login permanece limpa e focada no formulário de autenticação.
5. [x] **Qualidade Comprovada:** Testes unitários dedicados ao Header e 100% da suíte existente mantida verde (169/169).
