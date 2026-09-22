# Planejamento Técnico — Fase 5 Visual: Padronização Visual do Módulo de Chamados (`src/features/tickets`)

> **Status:** Pronto para Execução  
> **Roadmap:** [ROADMAP do Frontend](../ROADMAP.md) — Fase 5  
> **Diretrizes:** [AD-001 — Paleta de Cores](../design/AD-001-paleta-de-cores.md) e [Design System README](../design/README.md)  
> **Objetivo:** Elevar o nível estético do módulo central do sistema (listagem, filtros, tabela, detalhe em 2 colunas, barra de ações, modais de atendimento, comentários e auditoria), alinhando tudo ao tema claro exclusivo, escala monocromática de laranja e primitivos do design system (`Table`, `Dialog`, `Badge`, `Select`, `Textarea`), mantendo 100% de integridade funcional e conformidade com todos os testes automatizados existentes.

---

## 1. Contexto & Diagnóstico

O módulo de tickets é a principal funcionalidade do CHAMAdos. Funcionalmente, 100% dos fluxos estão cobertos por testes unitários e de integração. Contudo, visualmente:
1. **Badges:** Possuem classes manuais legadas com variantes escuras residuais (`dark:bg-blue-500/20`).
2. **Tabela (`TicketTable`):** Usa marcação HTML manual com classes dispersas em vez de consumir os primitivos semânticos de `Table` criados na Fase 2.
3. **Filtros (`TicketFilterBar`):** Filtros soltos sem o encapsulamento em card corporativo e sem os primitivos unificados.
4. **Detalhe do Chamado (`TicketDetailPage`):** Não possui o layout de 2 colunas moderno (70% conteúdo / 30% metadados e ações contextuais).
5. **Modais do Ciclo de Atendimento:** `CreateTicketModal`, `AssignTicketModal`, `ResolveTicketModal`, `CloseTicketModal` e `ReopenTicketModal` utilizam backdrops manuais escuros (`bg-black/70`) e botões manuais em vez do primitivo acessível `Dialog`.
6. **Comentários & Auditoria:** Falta alinhamento estético de balões de conversa e timeline com a escala de neutros claros e laranja.

---

## 2. Divisão e Arquitetura da Fase 5

```
┌──────────────────────────────────────────────────────────────────────────┐
│ FASE 5: PADRONIZAÇÃO VISUAL DO MÓDULO DE CHAMADOS                        │
├──────────────────────────────────────────────────────────────────────────┤
│ 5.1 Listagem, Badges, Filtros e Tabela                                   │
│  ├─ Etapa 1: Unificação dos Badges (TicketStatusBadge, PriorityBadge)   │
│  ├─ Etapa 2: Barra de Filtros em Card Corporativo (TicketFilterBar)      │
│  ├─ Etapa 3: Migração da Tabela para o primitivo Table (TicketTable)     │
│  └─ Etapa 4: Página de Listagem e Ações Primárias (TicketsListPage)     │
├──────────────────────────────────────────────────────────────────────────┤
│ 5.2 Detalhes do Chamado e Painel de Ações                                │
│  └─ Etapa 5: Layout em 2 Colunas (70/30) e TicketActionsBar             │
├──────────────────────────────────────────────────────────────────────────┤
│ 5.3 Modais, Comentários e Auditoria                                      │
│  ├─ Etapa 6: Modais com Dialog (Create, Assign, Resolve, Close, Reopen) │
│  ├─ Etapa 7: Estilização de Comentários e Timeline de Auditoria          │
│  └─ Etapa 8: Validação de Build e Suíte de Testes (174+ testes)          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Etapas de Execução

---

### Etapa 1 — Unificação dos Badges (`TicketStatusBadge.tsx` e `TicketPriorityBadge.tsx`)

**Objetivo:** Eliminar classes legadas de dark mode e padronizar os badges com superfícies suaves e semântica clara.

**Arquivos a modificar:**
- `frontend/src/features/tickets/components/TicketStatusBadge.tsx`
- `frontend/src/features/tickets/components/TicketPriorityBadge.tsx`

**Ações específicas:**
1. Em `TicketStatusBadge.tsx`:
   - `OPEN`: Fundo Laranja suave (`bg-orange-100 text-orange-950 border-orange-200`) com dot animado em laranja (`bg-orange-600 animate-pulse`).
   - `IN_PROGRESS`: Fundo âmbar corporativo (`bg-amber-100 text-amber-950 border-amber-200`) com dot animado.
   - `RESOLVED`: Fundo esmeralda suave (`bg-emerald-100 text-emerald-950 border-emerald-200`) com dot fixo.
   - `CLOSED`: Fundo neutro suave (`bg-zinc-100 text-zinc-800 border-zinc-200`) com dot fixo.
2. Em `TicketPriorityBadge.tsx`:
   - `LOW`: Fundo verde suave (`bg-emerald-100 text-emerald-900 border-emerald-200`).
   - `MEDIUM`: Fundo azul suave corporativo (`bg-blue-100 text-blue-900 border-blue-200`).
   - `HIGH`: Fundo laranja suave (`bg-orange-100 text-orange-900 border-orange-200`).
   - `URGENT`: Fundo vermelho suave com dot pulsante (`bg-red-100 text-red-900 border-red-200 animate-pulse font-semibold`).
3. Manter os textos e testes unitários existentes 100% compatíveis.

**Checklist:**
- [x] `TicketStatusBadge.tsx` refatorado com tema claro.
- [x] `TicketPriorityBadge.tsx` refatorado com tema claro.
- [x] Testes unitários dos badges validados com sucesso.

---

### Etapa 2 — Barra de Filtros Corporativa (`TicketFilterBar.tsx`)

**Objetivo:** Encapsular os filtros em card branco suave, com inputs/selects alinhados no grid de 8px e botão "Limpar filtros".

**Arquivo a modificar:**
- `frontend/src/features/tickets/components/TicketFilterBar.tsx`

**Ações específicas:**
1. Envolver os filtros em card limpo com `border-border bg-card p-4 rounded-xl shadow-xs`.
2. Utilizar os novos primitivos de estilo e anel de foco em laranja.
3. Manter contratos e testes existentes de disparo de filtros e botão "Limpar filtros".

**Checklist:**
- [x] `TicketFilterBar.tsx` refatorado com card e layout 8px.
- [x] Testes de `TicketFilterBar.test.tsx` verdes.

---

### Etapa 3 — Migração da Tabela de Chamados para o Primitivo `Table` (`TicketTable.tsx`)

**Objetivo:** Substituir marcação crua por `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`.

**Arquivo a modificar:**
- `frontend/src/features/tickets/components/TicketTable.tsx`

**Ações específicas:**
1. Importar `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` de `@/components/ui/table`.
2. Preservar seletores como `data-testid="ticket-row-${ticket.id}"` e acessibilidade no botão de ações.
3. Estilizar cabeçalho suave, divisores finos e suporte nativo a scroll horizontal.

**Checklist:**
- [x] `TicketTable.tsx` migrado para os primitivos `Table`.
- [x] Seletores de testes preservados.
- [x] Testes de `TicketTable.test.tsx` verdes.

---

### Etapa 4 — Página de Listagem de Chamados (`TicketsListPage.tsx`)

**Objetivo:** Modernizar a tela principal de chamados com cabeçalho de destaque, CTA "+ Abrir Chamado" e controles de paginação.

**Arquivo a modificar:**
- `frontend/src/features/tickets/pages/TicketsListPage.tsx`

**Ações específicas:**
1. Cabeçalho com título `text-2xl font-bold tracking-tight text-foreground`, descrição e botão primário `+ Abrir Chamado` em laranja.
2. Controles de paginação compactos com botões estilizados (`variant="outline" size="sm"`).
3. Estados de carregamento e empty state com ícone semântico.

**Checklist:**
- [x] `TicketsListPage.tsx` refatorado.
- [x] Testes de `TicketsListPage.test.tsx` verdes.

---

### Etapa 5 — Detalhes do Chamado e Painel de Ações (`TicketDetailPage.tsx` e `TicketActionsBar.tsx`)

**Objetivo:** Implementar o layout em 2 colunas no desktop (70% conteúdo e histórico / 30% metadados e ações contextuais).

**Arquivos a modificar:**
- `frontend/src/features/tickets/pages/TicketDetailPage.tsx`
- `frontend/src/features/tickets/components/TicketActionsBar.tsx`

**Ações específicas:**
1. Layout em grid responsivo: `grid grid-cols-1 lg:grid-cols-3 gap-8`.
   - Coluna principal (`lg:col-span-2 space-y-6`): título, descrição do chamado em card limpo, comentários e auditoria.
   - Coluna lateral (`lg:col-span-1 space-y-6`): card de metadados corporativo (solicitante, técnico responsável, data de abertura, status, prioridade) e `TicketActionsBar`.
2. Em `TicketActionsBar.tsx`: botões com variantes semânticas adequadas (`default` em laranja para assumir/resolver, `outline` para reabrir, `destructive` para encerrar).

**Checklist:**
- [ ] `TicketDetailPage.tsx` com layout 2 colunas responsivo.
- [ ] `TicketActionsBar.tsx` com variantes semânticas atualizadas.
- [ ] Testes de `TicketDetailPage.test.tsx` e `TicketActionsBar.test.tsx` verdes.

---

### Etapa 6 — Migração dos Modais de Atendimento para o Primitivo `Dialog`

**Objetivo:** Substituir modais manuais pelo componente primitivo acessível `Dialog` com backdrop blur suave.

**Arquivos a modificar:**
- `frontend/src/features/tickets/components/CreateTicketModal.tsx`
- `frontend/src/features/tickets/components/AssignTicketModal.tsx`
- `frontend/src/features/tickets/components/ResolveTicketModal.tsx`
- `frontend/src/features/tickets/components/CloseTicketModal.tsx`
- `frontend/src/features/tickets/components/ReopenTicketModal.tsx`

**Ações específicas:**
1. Utilizar `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
2. Manter campos, labels, validações de erro e atributos `data-testid` intactos para não quebrar testes.
3. Botões de ação em laranja primário e botões de cancelamento em `outline`.

**Checklist:**
- [ ] 5 modais migrados para `Dialog`.
- [ ] Testes unitários dos 5 modais aprovados.

---

### Etapa 7 — Seções de Comentários e Auditoria

**Objetivo:** Estilizar balões de comentários modernos e timeline vertical de auditoria.

**Arquivos a modificar:**
- `frontend/src/features/tickets/components/TicketCommentsSection.tsx`
- `frontend/src/features/tickets/components/CommentForm.tsx`
- `frontend/src/features/tickets/components/CommentItem.tsx`
- `frontend/src/features/tickets/components/TicketAuditSection.tsx`
- `frontend/src/features/tickets/components/TicketAuditItem.tsx`

**Ações específicas:**
1. Balões de comentários limpos com separação clara de autor, data relativa e conteúdo formatado.
2. `CommentForm` consumindo o primitivo `Textarea` e botão de envio em laranja com contador de caracteres.
3. Timeline de auditoria com linha vertical neutra, nós de evento com ícones contextuais e badges de status.

**Checklist:**
- [ ] Comentários estilizados em balões corporativos.
- [ ] Auditoria com timeline vertical nítida.
- [ ] Testes de comentários e auditoria verdes.

---

### Etapa 8 — Validação Geral de Build e Suíte de Regressão

**Objetivo:** Garantir zero quebras na aplicação completa.

**Comandos de validação:**
1. `npm run build`
2. `npm run test:run`

**Checklist:**
- [ ] `npm run build` verde sem erros de TypeScript ou CSS.
- [ ] `npm run test:run` aprovado com 35 arquivos e 174+ testes verdes.

---

## 4. Critérios de Aceitação da Fase 5

1. **Módulo de Chamados 100% Padronizado:** Listagem, filtros, tabela, detalhe, modais, comentários e auditoria alinhados ao design system claro e laranja.
2. **Zero Regressão Funcional:** Todas as 35 suítes de teste existentes continuam aprovadas com 100% de sucesso.
3. **Acessibilidade e Usabilidade:** Foco visível, modais com focus trap e tabelas com rolagem horizontal suave em mobile.
