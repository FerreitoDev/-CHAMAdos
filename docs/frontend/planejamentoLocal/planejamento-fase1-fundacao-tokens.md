# Planejamento Técnico — Fase 1 Visual: Fundação de Tokens e Tema Claro (Base Visual)

> **Status:** Concluído  
> **Roadmap:** [ROADMAP do Frontend](../ROADMAP.md) — Fase 1  
> **Diretrizes:** [AD-001 — Paleta de Cores e Identidade Visual](../design/AD-001-paleta-de-cores.md) e [Design System README](../design/README.md)  
> **Objetivo:** Estabelecer a fundação estética monocromática em laranja e superfícies exclusivamente claras em `frontend/src/index.css`, eliminando o dark mode legado e garantindo zero regressão na suíte de testes (164 testes).

---

## 1. Contexto & Diagnóstico

O frontend do **CHAMAdos** possui 100% da lógica do MVP implementada e testada. No entanto, o arquivo `src/index.css` atual mantém:

1. **Tema escuro legado no `:root`:**
   - `--background: oklch(0.16 0.015 40)` (fundo escuro/cinza carvão).
   - `--foreground: oklch(0.96 0.01 85)` (texto claro).
2. **Definição explícita da classe `.dark` e `@custom-variant dark`:**
   - Inconsistente com a decisão arquitetural de **Tema Exclusivamente Claro (Light Mode)**.
3. **Ausência de tokens funcionais essenciais do AD-001:**
   - Faltam `--primary-hover` (`oklch(0.53 0.18 38)` / `#C2410C`) e `--primary-subtle` (`oklch(0.95 0.03 65)` / `#FFEDD5`).
   - Falta mapeamento dessas propriedades no bloco `@theme inline` do Tailwind CSS v4 para geração de utilitários nativos (`bg-primary-hover`, `bg-primary-subtle`, `text-primary-hover`, etc.).
4. **Bordas e neutros desajustados:**
   - `--border` e `--input` atuais usam escala genérica `oklch(0.922 0 0)` em vez dos tons calibrados da escala Zinc previstos no design system (`oklch(0.92 0.005 260)` / `#E4E4E7`).
   - `--radius` atual está em `0.625rem` (10px), enquanto a especificação formal do AD-001 define `0.5rem` (8px), mantendo o alinhamento com o grid matemático de 8px.

---

## 2. Especificação Técnica dos Tokens (AD-001)

### 2.1 Tokens do Seletor `:root`

| Variável CSS | Valor OKLCH / Hex Equivalente | Descrição Funcional |
|---|---|---|
| `--background` | `oklch(0.985 0.002 90)` (`#FAFAFA`) | Superfície base da aplicação |
| `--foreground` | `oklch(0.18 0.01 260)` (`#18181B`) | Texto primário de alto contraste |
| `--card` | `oklch(1 0 0)` (`#FFFFFF`) | Fundo de cards, painéis e tabelas |
| `--card-foreground` | `oklch(0.18 0.01 260)` (`#18181B`) | Texto sobre cards |
| `--popover` | `oklch(1 0 0)` (`#FFFFFF`) | Fundo de dropdowns, menus e modais |
| `--popover-foreground` | `oklch(0.18 0.01 260)` (`#18181B`) | Texto sobre popovers |
| `--primary` | `oklch(0.62 0.20 40)` (`#EA580C` - Orange 600) | Ação primária, botões principais e destaques |
| `--primary-foreground` | `oklch(1 0 0)` (`#FFFFFF`) | Texto sobre botões primários |
| `--primary-hover` | `oklch(0.53 0.18 38)` (`#C2410C` - Orange 700) | Estado hover de botões primários |
| `--primary-subtle` | `oklch(0.95 0.03 65)` (`#FFEDD5` - Orange 100) | Fundos de ênfase sutil, badges e tags |
| `--secondary` | `oklch(0.96 0.005 260)` (`#F4F4F5`) | Botões secundários e linhas zebradas |
| `--secondary-foreground` | `oklch(0.27 0.01 260)` (`#27272A`) | Texto de botões secundários |
| `--muted` | `oklch(0.96 0.005 260)` (`#F4F4F5`) | Fundos inativos ou de suporte |
| `--muted-foreground` | `oklch(0.50 0.01 260)` (`#71717A`) | Labels e textos secundários |
| `--accent` | `oklch(0.95 0.03 65)` (`#FFEDD5`) | Hover sutil de menus e seleções |
| `--accent-foreground` | `oklch(0.44 0.15 38)` (`#9A3412`) | Texto de elementos accent ativos |
| `--destructive` | `oklch(0.58 0.22 25)` (`#DC2626` - Red 600) | Ações de exclusão, erros e alertas |
| `--destructive-foreground` | `oklch(1 0 0)` (`#FFFFFF`) | Texto sobre fundo destrutivo |
| `--border` | `oklch(0.92 0.005 260)` (`#E4E4E7` - Zinc 200) | Divisores e bordas estruturais |
| `--input` | `oklch(0.92 0.005 260)` (`#E4E4E7` - Zinc 200) | Borda de inputs em repouso |
| `--ring` | `oklch(0.62 0.20 40)` (`#EA580C`) | Anel de foco acessível (`focus-visible`) |
| `--radius` | `0.5rem` (`8px`) | Raio base arredondado (grid de 8px) |

---

## 3. Etapas de Execução

---

### Etapa 1 — Atualização dos Tokens no `:root` e Limpeza do Dark Mode

**Objetivo:** Substituir os valores de `:root` pelos tokens claros calibrados e remover o seletor `.dark` e `@custom-variant dark`.

**Arquivo a modificar:**
- `frontend/src/index.css`

**Ações específicas:**
1. Remover `@custom-variant dark (&:is(.dark *));`.
2. Atualizar todos os tokens do bloco `:root` conforme a tabela da Seção 2.1.
3. Adicionar as variáveis `--primary-hover` e `--primary-subtle` no `:root`.
4. Remover completamente o seletor `.dark { ... }` (linhas 54 a 96).

**Checklist:**
- [x] `@custom-variant dark` removido.
- [x] `:root` atualizado com valores claros de `background`, `foreground`, `card`, `primary`, etc.
- [x] `--primary-hover` e `--primary-subtle` declarados em `:root`.
- [x] Seletor `.dark` removido.
- [x] `--radius` ajustado para `0.5rem`.

---

### Etapa 2 — Mapeamento de Tokens no `@theme inline` do Tailwind CSS v4

**Objetivo:** Garantir que o motor do Tailwind CSS v4 exponha as classes de utilitário necessárias para consumo em toda a aplicação.

**Arquivo a modificar:**
- `frontend/src/index.css`

**Ações específicas:**
1. No bloco `@theme inline`:
   - Adicionar `--color-primary-hover: var(--primary-hover);`.
   - Adicionar `--color-primary-subtle: var(--primary-subtle);`.
   - Adicionar `--color-destructive-foreground: var(--destructive-foreground);`.
   - Garantir preservação das extensões existentes (`--font-sans`, cores de chart, raios de borda).

**Checklist:**
- [x] `--color-primary-hover` registrado em `@theme inline`.
- [x] `--color-primary-subtle` registrado em `@theme inline`.
- [x] `--color-destructive-foreground` registrado em `@theme inline`.
- [x] Sintaxe `@theme inline` validada pelo compilador do Tailwind v4.

---

### Etapa 3 — Validação de Build, Lint e Regressão de Testes

**Objetivo:** Assegurar que as alterações de CSS não quebrem a compilação do Vite/Tailwind nem afetem os testes existentes.

**Comandos de validação:**
1. `npm run build` (validação de bundling com Vite + PostCSS/Tailwind v4).
2. `npm run lint` (verificação de integridade estática).
3. `npm run test:run` (garantia de 164/164 testes passando sem regressão).

**Checklist:**
- [x] `npm run build` executado com sucesso (zero erros de compilação CSS/TypeScript).
- [x] Validação estática de CSS e TS realizada.
- [x] `npm run test:run` aprovado com 33 arquivos e 164 testes verdes.

---

## 4. Critérios de Aceitação da Fase 1

1. [x] **Tema Claro Ativo por Padrão:** A aplicação renderiza com fundo `#FAFAFA` (`oklch(0.985 0.002 90)`) e texto `#18181B`.
2. [x] **Tokens de Destaque Disponíveis:** Classes `bg-primary`, `bg-primary-hover`, `bg-primary-subtle` utilizáveis diretamente via Tailwind.
3. [x] **Código Limpo e Sem Resíduos:** Nenhuma menção a `.dark` ou `@custom-variant dark` em `src/index.css`.
4. [x] **Estabilidade Comprovada:** Build de produção verde e 100% dos testes mantidos com sucesso (164/164).
