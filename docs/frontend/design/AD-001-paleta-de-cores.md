# AD-001 — Paleta de Cores

Os tokens de cor do CHAMAdos são definidos em `src/index.css` como CSS custom properties no formato `oklch`.

## Tema padrão: Dark Mode

O CHAMAdos utiliza **dark mode como tema padrão**. O modo claro existe mas não é o padrão do sistema.

## Tokens principais

### Superfícies

| Token | Valor (dark) | Uso |
|---|---|---|
| `--background` | `oklch(0.16 0.015 40)` | Fundo da página |
| `--card` | `oklch(0.20 0.018 40)` | Cards e painéis |
| `--popover` | `oklch(0.20 0.018 40)` | Popovers e dropdowns |
| `--sidebar` | `oklch(0.205 0 0)` | Fundo da sidebar |

### Texto

| Token | Valor (dark) | Uso |
|---|---|---|
| `--foreground` | `oklch(0.96 0.01 85)` | Texto principal |
| `--muted-foreground` | `oklch(0.70 0.02 50)` | Texto secundário/suave |
| `--card-foreground` | `oklch(0.96 0.01 85)` | Texto sobre cards |

### Cor primária

| Token | Valor (dark) | Uso |
|---|---|---|
| `--primary` | `oklch(0.72 0.18 55)` | Laranja queimado — ações principais, botões CTA |
| `--primary-foreground` | `oklch(0.16 0.02 40)` | Texto sobre fundo primário |

> A cor primária representa o conceito de fogo do CHAMAdos. Deve ser usada com moderação para destacar ações e elementos importantes.

### Cores semânticas

| Token | Valor | Uso |
|---|---|---|
| `--destructive` | `oklch(0.65 0.20 25)` | Ações destrutivas, erros |
| `--muted` | `oklch(0.25 0.02 40)` | Elementos de fundo suave |
| `--accent` | `oklch(0.27 0.04 55)` | Destaques leves, hovers |

### Bordas e inputs

| Token | Valor | Uso |
|---|---|---|
| `--border` | `oklch(1 0 0 / 10%)` | Bordas gerais |
| `--input` | `oklch(1 0 0 / 15%)` | Borda de inputs |
| `--ring` | `oklch(0.556 0 0)` | Focus ring |

### Raio de borda

| Token | Valor | Uso |
|---|---|---|
| `--radius` | `0.625rem` | Base para bordas arredondadas |
| `--radius-sm` | `0.375rem` | Bordas pequenas |
| `--radius-md` | `0.5rem` | Bordas médias |
| `--radius-lg` | `0.625rem` | Bordas grandes (padrão) |

## Tipografia

- **Fonte principal:** `Inter Variable` (`@fontsource-variable/inter`)
- Aplicada globalmente via `--font-sans`

## Como usar

Os tokens são consumidos via classes do Tailwind CSS. Exemplos:

```tsx
// Cor primária
<button className="bg-primary text-primary-foreground">Abrir chamado</button>

// Texto muted
<span className="text-muted-foreground">Nenhum chamado encontrado</span>

// Destrutivo
<button className="bg-destructive text-white">Excluir</button>
```

## Observação

A paleta completa está centralizada em `frontend/src/index.css`. Alterações de cor devem ser feitas **exclusivamente nesse arquivo** para garantir consistência.
