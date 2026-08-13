# AD-002 — Papéis e responsabilidades

**Decisão:** O sistema terá inicialmente três papéis: `USER`, `TECHNICIAN` e `ADMIN`.

## USER

Usuário que solicita atendimento.

Pode:

- criar chamados;
- visualizar seus próprios chamados;
- adicionar comentários;
- reabrir chamados.

## TECHNICIAN

Responsável pelo atendimento técnico.

Pode:

- visualizar chamados disponíveis;
- assumir chamados;
- adicionar comentários;
- alterar prioridade;
- alterar status;
- resolver chamados.

O técnico não pode encerrar definitivamente um chamado.

## ADMIN

Responsável pela administração e supervisão do atendimento.

Pode:

- gerenciar usuários;
- gerenciar categorias;
- visualizar e gerenciar chamados;
- encerrar chamados;
- acessar relatórios administrativos.
- atribuir chamados a técnicos;
- reatribuir chamados entre técnicos.
- impedir que técnicos assumam chamados

## Ciclo de resolução

Resolver e encerrar são ações diferentes.

O técnico pode marcar um chamado como `RESOLVED`, indicando que o problema foi solucionado.

O encerramento definitivo (`CLOSED`) é responsabilidade do administrador.

Isso permite supervisão do atendimento e evita que chamados sejam encerrados sem a devida verificação.

## Relatórios

O sistema deverá fornecer informações agregadas sobre os atendimentos para uso administrativo, incluindo métricas como:

- quantidade de chamados por técnico;
- chamados por período;
- chamados por status;
- chamados por categoria;
- chamados por prioridade;
- métricas de atendimento.

Os relatórios serão derivados dos dados dos domínios existentes e não constituem inicialmente um domínio independente.