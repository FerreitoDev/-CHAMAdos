# Arquitetura

## Objetivo

Definir a estrutura técnica e as responsabilidades do sistema CHAMAdos, mantendo o projeto organizado, testável e preparado para evolução.

A arquitetura deve permitir que diferentes partes do sistema evoluam sem criar dependências desnecessárias entre elas.

## Domínios

## Users

O sistema possui inicialmente três papéis:

### USER

Usuário que solicita atendimento.

Responsabilidades:

- criar chamados;
- visualizar seus próprios chamados;
- adicionar comentários;
- reabrir chamados.

### TECHNICIAN

Usuário responsável pelo atendimento técnico.

Responsabilidades:

- visualizar chamados disponíveis para atendimento;
- assumir chamados;
- adicionar comentários;
- alterar prioridade;
- alterar status;
- resolver chamados.

### ADMIN

Usuário responsável pela administração do sistema.

Responsabilidades:

- gerenciar usuários;
- gerenciar categorias;
- administrar o sistema;
- visualizar e gerenciar chamados conforme necessário.

Novos papéis somente devem ser adicionados quando houver uma necessidade real do domínio.

## Ticket

Um Ticket representa uma solicitação de atendimento.

### Dados principais

- `id` — identificador único.
- `title` — resumo do chamado.
- `description` — descrição detalhada.
- `comments` — comentários após a abertura
- `status` — estado atual.
- `priority` — prioridade.
- `requester` — usuário que abriu o chamado.
- `assignee` — usuário responsável pelo atendimento, podendo ser nulo.
- `category` — categoria do chamado.
- `createdAt` — data de criação.
- `updatedAt` — data da última alteração.
- `resolvedAt` — data em que o chamado foi resolvido, podendo ser nula.
- `closedAt` — data em que o chamado foi encerrado, podendo ser nula.

### Prioridades

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

### Relacionamentos

Um Ticket possui:

- um usuário solicitante;
- opcionalmente um usuário responsável;
- uma categoria;
- zero ou mais comentários;
- registros de auditoria relacionados.

O responsável (`assignee`) de um chamado pode ser definido de duas formas:

- um técnico assume voluntariamente um chamado sem responsável;
- um administrador atribui ou reatribui o chamado a um técnico.

Alterações de responsável devem ser registradas na auditoria.

## Categories

Categorias são utilizadas para classificar chamados.

O sistema possuirá categorias iniciais generalistas, que poderão ser complementadas por administradores.

Categorias não serão codificadas diretamente na aplicação. Serão registros iniciais do banco de dados.

Não haverá suporte a subcategorias inicialmente.

Categorias já utilizadas em chamados não devem ser removidas fisicamente. Quando necessário, devem ser desativadas para impedir seu uso em novos chamados sem afetar registros existentes.

## Comments

Comentários representam comunicação humana relacionada a um chamado.

Tanto o solicitante quanto o responsável pelo atendimento poderão adicionar comentários.

A descrição inicial do chamado é independente dos comentários posteriores.

Comentários poderão ser utilizados para:

- fornecer informações adicionais;
- relatar novas ocorrências;
- explicar uma solução;
- registrar informações relevantes para o atendimento;
- explicar o motivo de uma reabertura.

Comentários são diferentes dos registros de auditoria. Comentários representam comunicação entre usuários, enquanto auditoria registra automaticamente ações e alterações relevantes realizadas pelo sistema.

### Audit

Responsável pelo registro de ações e alterações relevantes realizadas no sistema.

## Princípios

- Separar responsabilidades por domínio.
- Manter regras de negócio fora dos controllers.
- Evitar acesso direto ao banco a partir dos controllers.
- Validar entradas antes de executar operações.
- Priorizar código testável.
- Evitar abstrações sem necessidade.
- Preferir soluções simples quando não houver necessidade de maior complexidade.

## Ciclo de vida dos chamados

Um chamado possui os seguintes estados:

- `OPEN` — criado e aguardando atendimento.
- `IN_PROGRESS` — atendimento em andamento.
- `RESOLVED` — problema solucionado, aguardando encerramento.
- `CLOSED` — chamado encerrado.

### Transições

```text
OPEN → IN_PROGRESS

IN_PROGRESS → OPEN
IN_PROGRESS → RESOLVED

RESOLVED → CLOSED
RESOLVED → OPEN

CLOSED → OPEN 
```

As permissões para realizar cada transição serão definidas posteriormente.

Mudanças de estado relevantes devem ser registradas no histórico de auditoria.