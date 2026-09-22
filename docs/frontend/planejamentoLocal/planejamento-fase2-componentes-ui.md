# Planejamento Técnico — Fase 2 Visual: Expansão da Biblioteca de Componentes UI (`src/components/ui`)

> **Status:** Pronto para Execução  
> **Roadmap:** [ROADMAP do Frontend](../ROADMAP.md) — Fase 2  
> **Diretrizes:** [AD-001 — Paleta de Cores e Identidade Visual](../design/AD-001-paleta-de-cores.md) e [Design System README](../design/README.md)  
> **Objetivo:** Fornecer os blocos primitivos acessíveis e estilizados segundo a nova escala de laranja e superfícies neutras em `src/components/ui`, preparando o ecossistema de componentes para o App Shell (Fase 3) e para a padronização das telas de chamados, categorias e usuários (Fases 4 a 6).

---

## 1. Contexto & Diagnóstico

Atualmente, `frontend/src/components/ui` possui apenas:
- `button.tsx` (estilizado com base `@base-ui/react/button`, variantes `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`)
- `card.tsx` (container com padding e grid de 8px)
- `input.tsx` (controle de texto com base `@base-ui/react/input`)
- `label.tsx` (rótulo acessível)

Para que as próximas fases do Roadmap Visual (Header corporativo, listagem de chamados, paginação, filtros, modais de ciclo de atendimento e auditoria) sejam implementadas de forma padronizada e limpa (sem classes manuais espalhadas nas páginas), são necessários 7 novos componentes primitivos do design system:

| Componente | Função / Uso Principal | Base Tecnológica |
|---|---|---|
| **`badge.tsx`** | Badges de status, papéis e prioridades de chamados | `@base-ui/react` + CVA |
| **`skeleton.tsx`** | Placeholders de carregamento progressivo | CSS Utilitário / React |
| **`textarea.tsx`** | Descrição de chamados, notas de encerramento e comentários | HTML textarea + estilos unificados ao `Input` |
| **`select.tsx`** | Filtros de status, seleção de técnico, categoria e papéis | `@base-ui/react/select` |
| **`table.tsx`** | Tabela corporativa de chamados, usuários e categorias | Marcação semântica (`table`, `thead`, `tbody`, `tr`, `td`, `th`) |
| **`dialog.tsx`** | Modais acessíveis com backdrop blur e focus trap | `@base-ui/react/dialog` |
| **`dropdown-menu.tsx`** | Menus de ações rápidas em linhas de tabela e menu de perfil | `@base-ui/react/menu` |

---

## 2. Especificação Técnica dos Novos Componentes

### 2.1 `badge.tsx`
Variantes alinhadas ao AD-001:
- `default`: Fundo laranja suave com texto de alto contraste (`bg-orange-100 text-orange-950 border border-orange-200`).
- `secondary`: Neutro corporativo suave (`bg-secondary text-secondary-foreground border border-border`).
- `outline`: Transparente com contorno sutil (`border border-border text-foreground`).
- `destructive`: Vermelho sutil para prioridade urgente ou falhas (`bg-red-100 text-red-800 border border-red-200`).

### 2.2 `skeleton.tsx`
- Elemento animado em pulso suave (`bg-muted animate-pulse rounded-md`).
- Utilizado para manter a densidade visual enquanto requisições assíncronas acontecem.

### 2.3 `textarea.tsx`
- Visual estritamente sincronizado com `Input` (`border-input bg-transparent text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`).
- Suporte a redimensionamento vertical seguro (`min-h-[80px] resize-y`).

### 2.4 `select.tsx`
- Componentes compostos: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`.
- Altura padronizada `h-9`, alinhamento no grid de 8px e anel de foco em laranja.

### 2.5 `table.tsx`
- Componentes semânticos: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`.
- Cabeçalho neutro sutil (`bg-muted/40 font-medium text-muted-foreground`), bordas finas (`border-border`), hover agradável nas linhas (`hover:bg-muted/50`).

### 2.6 `dialog.tsx`
- Componentes: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`.
- Backdrop blur suave (`bg-black/40 backdrop-blur-xs`), card centralizado em branco puro (`bg-card border border-border shadow-lg`), foco gerenciado e animação de entrada limpa.

### 2.7 `dropdown-menu.tsx`
- Componentes: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`.
- Superfície branca flutuante (`bg-popover border border-border shadow-md rounded-md p-1`), com hover em laranja sutil (`focus:bg-accent focus:text-accent-foreground`).

---

## 3. Etapas de Execução

---

### Etapa 1 — Componentes de Indicadores: `badge.tsx` e `skeleton.tsx`

**Objetivo:** Adicionar componentes visuais de status e loading.

**Arquivos a criar:**
- `frontend/src/components/ui/badge.tsx`
- `frontend/src/components/ui/skeleton.tsx`

**Ações específicas:**
1. Criar `badge.tsx` utilizando `@base-ui/react` e CVA com as variantes `default`, `secondary`, `outline`, `destructive`.
2. Criar `skeleton.tsx` com `cn("animate-pulse rounded-md bg-muted", className)`.
3. Garantir que os imports utilizem `@/lib/utils` (padrão do projeto).

**Checklist:**
- [x] `src/components/ui/badge.tsx` criado e tipado.
- [x] `src/components/ui/skeleton.tsx` criado.
- [x] Variantes de cores do AD-001 validadas.

---

### Etapa 2 — Controles de Formulário: `textarea.tsx` e `select.tsx`

**Objetivo:** Adicionar primitivos para entrada de texto multilinhas e seleção acessível.

**Arquivos a criar:**
- `frontend/src/components/ui/textarea.tsx`
- `frontend/src/components/ui/select.tsx`

**Ações específicas:**
1. Criar `textarea.tsx` alinhado ao visual e classes de `input.tsx`.
2. Criar `select.tsx` utilizando os primitivos do `@base-ui/react/select` suportados pelo shadcn base-vega.
3. Assegurar consistência de estados de foco (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`).

**Checklist:**
- [x] `src/components/ui/textarea.tsx` criado.
- [x] `src/components/ui/select.tsx` criado com subcomponentes.
- [x] Alinhamento visual e altura `h-9` verificados.

---

### Etapa 3 — Estrutura de Dados: `table.tsx`

**Objetivo:** Adicionar componentes semânticos de tabela corporativa.

**Arquivo a criar:**
- `frontend/src/components/ui/table.tsx`

**Ações específicas:**
1. Criar `table.tsx` exportando `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`.
2. Estilizar com cabeçalho em tom neutro suave, divisores finos e suporte a scroll horizontal responsivo via wrapper `div.relative.w-full.overflow-auto`.

**Checklist:**
- [x] `src/components/ui/table.tsx` criado e com exportações semânticas completas.
- [x] Responsividade com overflow horizontal garantida.

---

### Etapa 4 — Camada de Sobreposição: `dialog.tsx` e `dropdown-menu.tsx`

**Objetivo:** Adicionar modais e menus suspensos com acessibilidade, focus trap e fechamento com tecla Escape.

**Arquivos a criar:**
- `frontend/src/components/ui/dialog.tsx`
- `frontend/src/components/ui/dropdown-menu.tsx`

**Ações específicas:**
1. Criar `dialog.tsx` utilizando `@base-ui/react/dialog` com `DialogOverlay` (backdrop suave), `DialogContent` centralizado e botão de fechar acessível com ícone `X` do `lucide-react`.
2. Criar `dropdown-menu.tsx` utilizando `@base-ui/react/menu` com posicionamento dinâmico e estilos de seleção.

**Checklist:**
- [x] `src/components/ui/dialog.tsx` criado.
- [x] `src/components/ui/dropdown-menu.tsx` criado.
- [x] Acessibilidade e animações suaves conferidas.

---

### Etapa 5 — Validação de Build, Tipagem e Testes

**Objetivo:** Assegurar que os 7 novos componentes compilam perfeitamente sem warnings, preservando 100% dos testes existentes.

**Comandos de validação:**
1. `npm run build`
2. `npm run test:run` (164 testes intactos)

**Checklist:**
- [ ] `npm run build` verde sem erros de TypeScript ou CSS.
- [ ] `npm run test:run` aprovado com 33 arquivos e 164 testes passando.

---

## 4. Critérios de Aceitação da Fase 2

1. **Biblioteca Expandida:** `badge.tsx`, `skeleton.tsx`, `textarea.tsx`, `select.tsx`, `table.tsx`, `dialog.tsx` e `dropdown-menu.tsx` presentes em `src/components/ui`.
2. **Padrão de Código Coeso:** Todos os componentes utilizam `@/lib/utils` e a identidade de tokens do tema claro e escala de laranja do AD-001.
3. **Zero Regressão:** `npm run build` e `npm run test:run` aprovados com 100% de sucesso.
