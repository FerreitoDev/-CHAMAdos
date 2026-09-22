# AD-001 — Paleta de Cores e Identidade Visual (Tema Claro Monocromático)

> **Status:** Atualizado  
> **Tema:** Exclusivamente Claro (Light Mode)  
> **Identidade:** Monocromática baseada em Escala Tonal de Laranja  
> **Arquitetura de Tokens:** CSS Custom Properties em formato `oklch` com compatibilidade Tailwind CSS v4 e shadcn/ui.

---

## 1. Princípios da Nova Direção Visual

1. **Tema Exclusivamente Claro:** A interface utiliza superfícies claras profissionais com contraste balanceado para longas jornadas de trabalho em sistemas de TI.
2. **Monocromatismo em Laranja:** A identidade do CHAMAdos ("fogo / chamado") é ancorada em uma escala tonal consistente de laranja. Não há cores primárias concorrentes; cores semânticas adicionais restringem-se a estados estritamente necessários (ex: vermelho para destrutivo/erro).
3. **Neutros Estruturais:** Fundos, textos, divisores e bordas utilizam neutros precisos da escala Zinc para garantir contraste conforme as diretrizes WCAG 2.1 AA (mínimo de 4.5:1 para texto normal e 3:1 para controles).

---

## 2. Escala Tonal de Laranja (Orange Scale)

| Nível | Hex | OKLCH | Papel / Função no Design System |
|---|---|---|---|
| **`orange-950`** | `#431407` | `oklch(0.24 0.08 38)` | Texto de alto contraste sobre fundos alaranjados claros (badges, alertas). |
| **`orange-900`** | `#7C2D12` | `oklch(0.35 0.12 38)` | Títulos de ênfase especial, estados pressionados profundos. |
| **`orange-800`** | `#9A3412` | `oklch(0.44 0.15 38)` | Links ativos e ícones em foco de alta visibilidade. |
| **`orange-700`** | `#C2410C` | `oklch(0.53 0.18 38)` | **`primary-hover`** — Estado hover de botões e CTAs primários. |
| **`orange-600`** | `#EA580C` | `oklch(0.62 0.20 40)` | **`primary`** — Cor primária principal (ações, CTAs, foco, links). Contraste > 4.5:1 com branco. |
| **`orange-500`** | `#F97316` | `oklch(0.69 0.19 45)` | Ícones interativos secundários, indicadores de status em andamento. |
| **`orange-400`** | `#FB923C` | `oklch(0.77 0.15 50)` | Bordas intermediárias de destaque e realce. |
| **`orange-300`** | `#FDBA74` | `oklch(0.84 0.11 55)` | Bordas de badges e seleções sutis. |
| **`orange-200`** | `#FED7AA` | `oklch(0.90 0.07 60)` | Fundo de itens selecionados e tags secundárias. |
| **`orange-100`** | `#FFEDD5` | `oklch(0.95 0.03 65)` | **`primary-subtle`** — Fundo sutil de destaque, badges abertas, hover de menus. |
| **`orange-50`**  | `#FFF7ED` | `oklch(0.985 0.01 70)` | Superfície alaranjada ultra suave para callouts e cards destacados. |

---

## 3. Tokens Semânticos e Neutros (CSS Custom Properties)

Definidos em `src/index.css` no seletor `:root`:

### 3.1 Superfícies e Estrutura

| Token | Valor OKLCH | Hex Aprox. | Aplicação |
|---|---|---|---|
| `--background` | `oklch(0.985 0.002 90)` | `#FAFAFA` | Fundo principal da aplicação (evita ofuscamento do branco puro). |
| `--foreground` | `oklch(0.18 0.01 260)` | `#18181B` | Texto principal com máximo contraste e legibilidade. |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Superfície dos cards, tabelas e painéis. |
| `--card-foreground` | `oklch(0.18 0.01 260)` | `#18181B` | Texto em cards e painéis. |
| `--popover` | `oklch(1 0 0)` | `#FFFFFF` | Menus suspensos, popovers e modais. |
| `--popover-foreground` | `oklch(0.18 0.01 260)` | `#18181B` | Texto em popovers e menus. |

### 3.2 Ações Primárias (Laranja Monocromático)

| Token | Valor OKLCH | Hex Aprox. | Aplicação |
|---|---|---|---|
| `--primary` | `oklch(0.62 0.20 40)` | `#EA580C` | Botões de ação primária (CTA), abas ativas, links. |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto e ícones sobre fundo primário (contraste 4.6:1). |
| `--primary-hover` | `oklch(0.53 0.18 38)` | `#C2410C` | Hover de botões primários. |
| `--primary-subtle` | `oklch(0.95 0.03 65)` | `#FFEDD5` | Fundos de ênfase leve e hover de navegação. |

### 3.3 Neutros de Apoio e Estados Secundários

| Token | Valor OKLCH | Hex Aprox. | Aplicação |
|---|---|---|---|
| `--secondary` | `oklch(0.96 0.005 260)` | `#F4F4F5` | Botões secundários, fundos de linha zebrada. |
| `--secondary-foreground` | `oklch(0.27 0.01 260)` | `#27272A` | Texto de ações secundárias. |
| `--muted` | `oklch(0.96 0.005 260)` | `#F4F4F5` | Elementos desabilitados ou de suporte. |
| `--muted-foreground` | `oklch(0.50 0.01 260)` | `#71717A` | Labels, textos secundários e metadados (contraste 4.6:1). |
| `--accent` | `oklch(0.95 0.03 65)` | `#FFEDD5` | Hover sutil de itens de menu e seleção. |
| `--accent-foreground` | `oklch(0.44 0.15 38)` | `#9A3412` | Texto em elementos com accent ativo. |

### 3.4 Bordas, Contornos e Acessibilidade

| Token | Valor OKLCH | Hex Aprox. | Aplicação |
|---|---|---|---|
| `--border` | `oklch(0.92 0.005 260)` | `#E4E4E7` | Divisores de layout, contornos de cards e tabelas. |
| `--input` | `oklch(0.92 0.005 260)` | `#E4E4E7` | Borda em repouso de inputs, selects e textareas. |
| `--ring` | `oklch(0.62 0.20 40)` | `#EA580C` | Anel de foco para navegação por teclado (`focus-visible`). |
| `--radius` | `0.5rem` | `8px` | Raio base de borda arredondada. |

### 3.5 Cor Destrutiva Semântica

| Token | Valor OKLCH | Hex Aprox. | Aplicação |
|---|---|---|---|
| `--destructive` | `oklch(0.58 0.22 25)` | `#DC2626` | Ações de cancelamento, desativação, exclusão e erros. |
| `--destructive-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto sobre fundo destrutivo. |

---

## 4. Tipografia e Proporções

* **Família Tipográfica:** `Inter Variable` (`@fontsource-variable/inter`).
* **Justificativa:** Fonte neutra, geométrica, com alta legibilidade em telas e suporte a números tabulares (`tabular-nums`), essencial para listagens e tabelas de tickets de TI.
* **Escala Tipográfica:**
  * H1 (Página): `28px` / `text-2xl font-bold tracking-tight`
  * H2 (Seções): `20px` / `text-xl font-semibold`
  * H3 (Cards/Modais): `16px` / `text-base font-semibold`
  * Corpo Principal: `14px` / `text-sm font-normal`
  * Metadados / Badges: `12px` / `text-xs font-medium`

---

## 5. Como Consumir no Código

Os tokens são expostos via Tailwind CSS v4 e consumidos através de classes utilitárias:

```tsx
// Botão Primário
<button className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] px-4 py-2 rounded-md font-medium text-sm">
  Abrir Chamado
</button>

// Card com superfície branca e borda neutra
<div className="bg-card text-card-foreground border border-border rounded-lg p-6 shadow-xs">
  <h3 className="text-base font-semibold text-foreground">Visão Geral</h3>
  <p className="text-sm text-muted-foreground mt-1">Status atualizado do chamado.</p>
</div>

// Badge Monocromática com escala de Laranja
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md bg-orange-100 text-orange-900 border border-orange-200">
  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
  Aberto
</span>
```
