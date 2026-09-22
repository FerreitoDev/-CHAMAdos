# Planejamento Técnico — Fase 4 Visual: Padronização Visual da Autenticação (`src/features/auth`)

> **Status:** Pronto para Execução  
> **Roadmap:** [ROADMAP do Frontend](../ROADMAP.md) — Fase 4  
> **Diretrizes:** [AD-001 — Paleta de Cores](../design/AD-001-paleta-de-cores.md) e [Design System README](../design/README.md)  
> **Objetivo:** Modernizar a experiência da tela de autenticação (`/login`), integrando-a à identidade visual monocromática em laranja (marca com ícone de chama), superfícies claras em zinc, alerta semântico de erro e foco acessível, criando também testes unitários automatizados para a página.

---

## 1. Contexto & Diagnóstico

Atualmente:
1. `src/features/auth/pages/LoginPage.tsx` utiliza uma interface simples sem a assinatura visual completa da marca (falta o ícone alaranjado característico introduzido no AppHeader).
2. O tratamento de mensagens de erro é renderizado como um texto solto vermelho sem container visual de alerta.
3. Não há cobertura de testes unitários dedicada para a página de login (`LoginPage.test.tsx`).
4. Os botões e inputs possuem dimensões padrão que podem ser refinadas para altura de `h-10` com espaçamento corporativo alinhado ao grid de 8px.

---

## 2. Especificação da Nova Interface (`LoginPage.tsx`)

### 2.1 Estrutura Visual do Card de Login

```
┌────────────────────────────────────────────────────────┐
│                        [ 🔥 ]                          │
│                       CHAMAdos                         │
│       Entre com suas credenciais para continuar        │
├────────────────────────────────────────────────────────┤
│  [ ⚠️  Credenciais inválidas. Verifique os dados.   ]  │ (Condicional)
│                                                        │
│  E-mail corporativo                                    │
│  [  exemplo@empresa.com                              ] │
│                                                        │
│  Senha de acesso                                       │
│  [  ••••••••••••                                     ] │
│                                                        │
│  [                 Entrar no Sistema                 ] │ (CTA Laranja)
└────────────────────────────────────────────────────────┘
```

1. **Cabeçalho do Card:**
   - Ícone de chama (`Flame` de `lucide-react`) em container alaranjado suave (`bg-orange-100 text-primary p-2.5 rounded-xl border border-orange-200/60 shadow-2xs mx-auto mb-2 w-fit`).
   - Título "CHAMAdos" em `text-2xl font-bold tracking-tight text-foreground`.
   - Subtítulo `text-sm text-muted-foreground`.

2. **Container e Superfícies:**
   - Card com borda neutra `border-border`, fundo branco puro `bg-card`, sombras suaves `shadow-sm` e largura máxima responsiva `max-w-sm w-full`.

3. **Alerta de Erro Semântico:**
   - Container com fundo suave de erro `bg-red-50 text-red-800 border border-red-200 rounded-lg p-3 text-sm flex items-center gap-2.5`.
   - Ícone `AlertCircle` de `lucide-react` para ancoragem visual.

4. **Campos e Botão Primário:**
   - Inputs com altura `h-10`, bordas sutis e foco em laranja (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`).
   - Botão de submit em laranja sólido com transição hover suave (`bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold h-10 shadow-2xs`).
   - Feedback em estado de submissão (`isSubmitting` exibe "Entrando..." e desabilita interações).

---

## 3. Etapas de Execução

---

### Etapa 1 — Refatoração e Modernização Visual de `LoginPage.tsx`

**Objetivo:** Aplicar a nova identidade visual no formulário e superfícies da tela de login.

**Arquivo a modificar:**
- `frontend/src/features/auth/pages/LoginPage.tsx`

**Ações específicas:**
1. Importar ícones `Flame` e `AlertCircle` de `lucide-react`.
2. Adicionar o bloco de cabeçalho da marca com o ícone de chama em laranja.
3. Substituir a exibição de erro por um alerta estruturado com ícone e borda suave.
4. Ajustar dimensões de inputs e botão CTA para `h-10` com transições de foco suaves.
5. Manter intactas todas as regras de negócio existentes (integração com `useAuth`, navegação com `from` e estados de submissão).

**Checklist:**
- [ ] Marca com ícone de chama integrada ao topo do card.
- [ ] Alerta de erro estruturado em `bg-red-50 text-red-800 border-red-200`.
- [ ] Inputs com foco em laranja e altura padronizada.
- [ ] Botão CTA em laranja com feedback de carregamento.

---

### Etapa 2 — Criação da Suíte de Testes `LoginPage.test.tsx`

**Objetivo:** Garantir cobertura automatizada para validações, submissão, tratamento de erro e redirecionamento.

**Arquivo a criar:**
- `frontend/src/features/auth/pages/LoginPage.test.tsx`

**Cenários a cobrir:**
1. Renderização dos elementos da tela (marca CHAMAdos, campos de e-mail e senha, botão de login).
2. Chamada de `login({ email, password })` com credenciais válidas ao submeter o formulário.
3. Exibição da mensagem de erro e do alerta visual caso a API retorne falha.
4. Desabilitação de campos e exibição de "Entrando..." durante a submissão.
5. Redirecionamento automático caso o usuário já esteja autenticado (`isAuthenticated === true`).

**Checklist:**
- [ ] `src/features/auth/pages/LoginPage.test.tsx` criado com 5+ testes.
- [ ] Todos os testes passando verde via `vitest`.

---

### Etapa 3 — Validação de Build e Suíte de Regressão

**Objetivo:** Garantir zero regressões na aplicação completa.

**Comandos de validação:**
1. `npm run build`
2. `npm run test:run`

**Checklist:**
- [ ] `npm run build` verde sem erros de TypeScript ou CSS.
- [ ] `npm run test:run` aprovado com 35 arquivos e 174+ testes verdes.

---

## 4. Critérios de Aceitação da Fase 4

1. **Consistência Visual:** Tela de login 100% harmonizada com o tema claro e escala monocromática de laranja do AD-001.
2. **Feedback Semântico Claro:** Mensagens de credenciais inválidas apresentadas em banner com contraste WCAG AA.
3. **Usabilidade e Acessibilidade:** Foco visível com anel em laranja e semântica de formulário preservada.
4. **Qualidade Garantida:** Suíte dedicada de testes unitários aprovada e zero quebras na aplicação.
