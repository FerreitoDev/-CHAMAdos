# Planejamento Técnico — Fase 6 Frontend: Módulo de Comentários em Chamados

Este documento detalha o plano de implementação da interface de **Comentários em Chamados** no frontend do **CHAMAdos**. Cada etapa é estritamente modular, testável e segue os padrões de código, TypeScript estrito, Zero Any e design system do projeto.

---

## 1. Visão Geral e Objetivos

Permitir que solicitantes, técnicos responsáveis e administradores visualizem o histórico de comunicação e publiquem novos comentários diretamente na página de detalhes do chamado.

**Fundação disponível no Backend (Fase 6 Backend 100% operacional):**
- `GET /tickets/:ticketId/comments` — Lista comentários em ordem cronológica com autor sanitizado.
- `POST /tickets/:ticketId/comments` — Cria novo comentário com validação de participantes e bloqueio para chamados com status `CLOSED`.
- Autenticação e RBAC integrados (`useAuth()`, papéis `USER`, `TECHNICIAN`, `ADMIN`).

---

## 2. Regras de Interface e Comportamento

### 2.1. Listagem de Comentários
- Exibir os comentários em ordem cronológica ascendente (mais antigos no topo, mais recentes abaixo).
- Cada comentário deve destacar:
  - Nome do autor e badge visual do seu papel (`ADMIN`, `TECHNICIAN`, `USER`).
  - Data e hora formatadas no padrão brasileiro (`dd/MM/yyyy HH:mm`).
  - Conteúdo do comentário com suporte a quebras de linha (`whitespace-pre-wrap`).
- Exibir estado de carregamento (*skeleton loading*) durante a busca inicial.
- Exibir estado vazio (*empty state*) amigável quando o chamado não possuir comentários.

### 2.2. Publicação de Novo Comentário
- Campo de texto (`Textarea`) com limite de 5000 caracteres e contador visual de caracteres restantes.
- Botão "Enviar comentário" desabilitado enquanto o texto estiver vazio ou apenas com espaços, ou durante a requisição (*loading*).
- Tratamento de erro com mensagem contextual em caso de falha na API.
- Se o chamado estiver encerrado (`ticket.status === 'CLOSED'`), o formulário de envio deve ser ocultado ou substituído por uma mensagem informativa clara: *"Este chamado está encerrado. Novos comentários estão desabilitados."*

---

## 3. Estrutura de Arquivos

```text
src/features/tickets/
├── api/
│   ├── comments.api.ts                  # Métodos HTTP getComments e createComment
│   └── comments.api.test.ts             # Testes unitários das chamadas à API
├── types/
│   └── comments.types.ts                # Interfaces Comment e CreateCommentPayload
├── components/
│   ├── CommentItem.tsx                  # Item visual de comentário com autor, data e conteúdo
│   ├── CommentItem.test.tsx             # Testes de renderização do comentário
│   ├── CommentForm.tsx                  # Formulário de criação com validação e bloqueio de CLOSED
│   ├── CommentForm.test.tsx             # Testes de validação e submissão do formulário
│   ├── TicketCommentsSection.tsx        # Seção agregadora com listagem, loading, empty state e form
│   └── TicketCommentsSection.test.tsx   # Testes unitários e de integração da seção
└── pages/
    ├── TicketDetailPage.tsx            # Página de detalhe integrada com TicketCommentsSection
    └── TicketDetailPage.test.tsx       # Testes da página com a seção de comentários
```

---

## 4. Detalhamento das Etapas de Implementação

---

### Etapa 1 — Tipos e Cliente de API de Comentários (`comments.types.ts` e `comments.api.ts`)

**Objetivo:** Definir os contratos de dados de comentários e criar os métodos de comunicação HTTP com o backend usando o `httpClient`.

**Arquivos a criar:**
```text
src/features/tickets/
├── types/comments.types.ts
├── api/comments.api.ts
└── api/comments.api.test.ts
```

**Contratos:**
- `Comment`:
  - `id: string`
  - `content: string`
  - `ticketId: string`
  - `authorId: string`
  - `createdAt: string`
  - `author: SafeUser` (id, name, email, role, active, createdAt, updatedAt)
- `CreateCommentPayload`:
  - `content: string`
- Métodos em `commentsApi`:
  - `getComments(ticketId: string): Promise<Comment[]>`
  - `createComment(ticketId: string, payload: CreateCommentPayload): Promise<Comment>`

**Checklist:**
- [x] Criar `comments.types.ts` com as interfaces de comentário e payload
- [x] Implementar `comments.api.ts` com métodos `getComments` e `createComment`
- [x] Criar testes unitários em `comments.api.test.ts` cobrindo sucesso e erros
- [x] Executar `npm run test` validando sucesso dos testes de API

---

### Etapa 2 — Componente de Exibição de Comentário (`CommentItem.tsx`)

**Objetivo:** Criar o componente individual para renderização de cada comentário com cabeçalho (autor, badge de papel, data) e corpo do texto.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── CommentItem.tsx
└── CommentItem.test.tsx
```

**Checklist:**
- [x] Implementar `CommentItem.tsx` com visual estilizado em card/caixa, badge de papel e formatação de data
- [x] Criar testes unitários em `CommentItem.test.tsx` verificando renderização de autor, data, badge e texto
- [x] Executar `npm run test CommentItem` garantindo 100% de aprovação

---

### Etapa 3 — Formulário de Envio de Comentário (`CommentForm.tsx`)

**Objetivo:** Implementar o formulário de envio de comentários com validação de entrada, contador de caracteres e bloqueio para chamados encerrados.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── CommentForm.tsx
└── CommentForm.test.tsx
```

**Checklist:**
- [ ] Implementar `CommentForm.tsx` com `Textarea`, botão de envio com ícone, contador de caracteres e tratamento de status `CLOSED`
- [ ] Criar testes unitários em `CommentForm.test.tsx` testando envio, validação de campos vazios, estado desabilitado e bloqueio de chamado encerrado
- [ ] Executar `npm run test CommentForm` garantindo 100% de aprovação

---

### Etapa 4 — Seção Integrada de Comentários (`TicketCommentsSection.tsx`)

**Objetivo:** Criar o componente agregador responsável por buscar comentários na montagem, exibir estados de loading/empty/erro, listar os itens e atualizar a lista reativamente após a submissão de novos comentários.

**Arquivos a criar:**
```text
src/features/tickets/components/
├── TicketCommentsSection.tsx
└── TicketCommentsSection.test.tsx
```

**Checklist:**
- [ ] Implementar `TicketCommentsSection.tsx` gerenciando estado assíncrono (loading, lista, erro, adição imediata)
- [ ] Criar testes unitários em `TicketCommentsSection.test.tsx` simulando busca, empty state, exibição de comentários e envio bem-sucedido
- [ ] Executar `npm run test TicketCommentsSection` com 100% de aprovação

---

### Etapa 5 — Integração na Página de Detalhe, Suíte Geral de Testes e Roadmap

**Objetivo:** Integrar a seção de comentários na página de detalhes do chamado (`TicketDetailPage.tsx`), validar a suíte completa de testes e atualizar o roadmap.

**Arquivos a modificar:**
```text
src/features/tickets/pages/
├── TicketDetailPage.tsx
└── TicketDetailPage.test.tsx
```

**Checklist:**
- [ ] Integrar `<TicketCommentsSection ticketId={ticket.id} isClosed={ticket.status === 'CLOSED'} />` na coluna principal da `TicketDetailPage.tsx`
- [ ] Atualizar `TicketDetailPage.test.tsx` para verificar a integração da seção de comentários
- [ ] Executar `npm run build` garantindo zero erros de tipagem/compilação no frontend
- [ ] Executar `npm run test` com 100% de aprovação em todos os testes do frontend
- [ ] Atualizar `docs/ROADMAP.md` marcando a Fase 6 Frontend como concluída

---

## 5. Critérios de Conclusão da Fase 6 (Frontend)

- [ ] Usuário visualiza a lista cronológica de comentários de um chamado na página de detalhes.
- [ ] Autor, data formatada e badge de papel são visíveis em cada comentário.
- [ ] Solicitante, técnico responsável ou administrador consegue digitar e enviar um novo comentário.
- [ ] A lista de comentários é atualizada imediatamente após o envio com sucesso.
- [ ] Chamados encerrados (`CLOSED`) exibem aviso e não permitem novos comentários.
- [ ] 100% dos testes unitários do frontend passando e build do Vite com 0 erros.
