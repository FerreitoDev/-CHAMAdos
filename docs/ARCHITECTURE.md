# Arquitetura

## Objetivo

Definir a estrutura técnica e as responsabilidades do sistema CHAMAdos, mantendo o projeto organizado, testável e preparado para evolução.

A arquitetura deve permitir que diferentes partes do sistema evoluam sem criar dependências desnecessárias entre elas.

## Domínios principais

### Identidade

Responsável por usuários, autenticação e permissões.

### Atendimento

Responsável pelo ciclo de vida dos chamados e pelas regras relacionadas ao atendimento.

### Classificação

Responsável pelas categorias utilizadas para classificar chamados.

### Comunicação

Responsável pela comunicação entre os envolvidos em um chamado.

### Auditoria

Responsável pelo registro das alterações e ações relevantes realizadas no sistema.

## Princípios

- Separar responsabilidades por domínio.
- Manter regras de negócio fora dos controllers.
- Evitar acesso direto ao banco a partir dos controllers.
- Validar entradas antes de executar operações.
- Priorizar código testável.
- Evitar abstrações sem necessidade.
- Preferir soluções simples quando não houver necessidade de maior complexidade.