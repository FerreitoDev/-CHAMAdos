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

## Configurações administrativas

O sistema possuirá configurações que permitem aos administradores controlar determinados comportamentos.

Inicialmente:

- `allowTechnicianSelfAssignment` — define se técnicos podem assumir chamados sem responsável.

Quando desabilitada, a distribuição dos chamados fica sob controle dos administradores.

## Ticket

Um Ticket representa uma solicitação de atendimento.

### Dados principais

- `id` — identificador único.
- `title` — resumo do chamado.
- `description` — descrição detalhada.
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

## Fluxo de atendimento

### Criação

Um usuário cria um chamado informando título, descrição, prioridade e categoria.

O chamado inicia em `OPEN` e pode não possuir responsável.

### Atribuição

Um técnico pode assumir um chamado sem responsável.

Um administrador pode atribuir ou reatribuir um chamado a um técnico.

Quando um chamado é assumido ou atribuído para atendimento, seu estado passa para `IN_PROGRESS`.

### Atendimento

Usuários e técnicos podem adicionar comentários ao chamado durante o atendimento.

### Resolução

O técnico pode marcar o chamado como `RESOLVED`.

Ao resolver um chamado, o técnico deve registrar em comentário as informações relevantes sobre a solução.

### Encerramento

O administrador é responsável pelo encerramento definitivo do chamado.

Um chamado `RESOLVED` pode ser encerrado pelo administrador, passando para `CLOSED`.

### Reabertura

Um chamado `RESOLVED` ou `CLOSED` pode ser reaberto quando o problema persistir ou houver necessidade de novo atendimento.

A reabertura deve ser acompanhada de um comentário explicando o motivo.

### Reatribuição

O administrador pode alterar o técnico responsável por um chamado.

Alterações de responsável devem ser registradas na auditoria.

## Notifications

Notificações são utilizadas para informar usuários sobre eventos relevantes relacionados aos chamados.

Inicialmente, as notificações serão internas ao sistema.

### Eventos

#### Chamado criado

Quando um chamado é criado:

- administradores devem ser notificados;
- técnicos devem ser notificados caso a configuração de autoatribuição esteja habilitada.

#### Chamado atribuído

Quando um chamado é atribuído a um técnico:

- o técnico atribuído deve ser notificado;
- o solicitante deve ser notificado.

#### Chamado resolvido

Quando um técnico resolve um chamado:

- administradores devem ser notificados para que possam revisar e encerrar o chamado.

#### Chamado encerrado

Quando um administrador encerra um chamado:

- o solicitante deve ser notificado.

#### Chamado reaberto

Quando um chamado é reaberto:

- administradores devem ser notificados;
- técnicos devem ser notificados caso a configuração de autoatribuição esteja habilitada.

### Características

Uma notificação deve identificar:

- o usuário destinatário;
- o chamado relacionado, quando aplicável;
- o tipo de evento;
- se já foi lida;
- quando foi criada.

Notificações são diferentes dos registros de auditoria. Auditoria registra permanentemente ações relevantes, enquanto notificações existem para chamar a atenção do usuário para eventos que exigem conhecimento ou ação.

Inicialmente, o sistema utilizará apenas notificações internas. Outros canais poderão ser adicionados futuramente.