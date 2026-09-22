# Design System — CHAMAdos

Este diretório documenta as decisões, tokens e padrões visuais do design system do CHAMAdos.

---

## 1. Princípios de Design

1. **Aparência Corporativa e Profissional:** Interface clara, sóbria e refinada, desenhada especificamente para gestão de chamados de tecnologia da informação (Helpdesk / Service Desk).
2. **Tema Exclusivamente Claro (Light Mode):** Fundo neutro suave (`#FAFAFA`), cards brancos puros (`#FFFFFF`) e bordas neutras refinadas (`#E4E4E7`), garantindo conforto visual e legibilidade.
3. **Identidade Monocromática em Laranja:** O conceito de "CHAMA" é expressado de forma madura através de uma escala tonal consistente de laranja (da cor de ação `#EA580C` aos tons sutis de realce `#FFEDD5`), sem cores primárias concorrentes.
4. **Grid Matemático de 8px:** Todo o sistema de layout, espaçamento (`padding`, `margin`, `gap`) e dimensões de componentes obedece à escala de 4px / 8px (4, 8, 12, 16, 24, 32, 48px).
5. **Densidade de Informação Equilibrada:** Densidade otimizada para produtividade operacional, permitindo visualização ágil de tabelas, filtros contextuais, históricos de auditoria e timelines de atendimento sem desperdício de espaço.
6. **Acessibilidade Inegociável (WCAG 2.1 AA):** Relações de contraste superiores a 4.5:1 para todo texto legível, estados de foco explícitos (`focus-visible:ring-primary/25`) e semântica nativa.

---

## 2. Stack Visual

* **Tailwind CSS v4:** Arquitetura CSS-first com `@theme inline` e custom properties em `oklch`.
* **shadcn/ui (Base Vega / React 19):** Biblioteca de componentes primitivos acessíveis, sem bloqueio de customização.
* **Lucide React:** Iconografia linear e semântica com baselines proporcionais (16px, 20px, 24px).
* **Inter Variable:** Tipografia corporativa otimizada para telas e dados tabulares (`tabular-nums`).

---

## 3. Estrutura de Documentos

* **[AD-001 — Paleta de Cores e Identidade Visual](AD-001-paleta-de-cores.md):** Especificação completa da escala tonal de laranja, superfícies neutras, tokens CSS e tabela de acessibilidade.
* **[ROADMAP do Frontend](../ROADMAP.md):** Planejamento passo a passo da evolução visual e estrutural do frontend.