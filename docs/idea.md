# Sistema de Chamados

## 1. Visão

Sistema de gerenciamento de chamados internos para empresas, permitindo que funcionários solicitem suporte e que equipes de atendimento gerenciem, acompanhem e resolvam essas solicitações.

O sistema deve priorizar organização, rastreabilidade e regras de negócio realistas, funcionando como uma aplicação empresarial de pequeno porte.

## 2. Objetivo

Criar uma aplicação completa que demonstre capacidade de desenvolver um sistema real, desde o gerenciamento dos chamados até autenticação, permissões, histórico e acompanhamento do atendimento.

O projeto deve priorizar **qualidade, organização e boas práticas**, e não a implementação mais rápida possível.

## Mapa

                         CHAMAdos 🔥
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        PRODUTO                           FUNDAÇÃO
             │                                 │
             │                    ┌────────────┴────────────┐
             │                    │                         │
       O que o sistema       Backend                  Frontend
       deve fazer             NestJS                    React
             │                    │                         │
             │                    ├── Banco               ├── UI
             │                    ├── API                 ├── Estado
             │                    ├── Auth                ├── Formulários
             │                    ├── Regras              └── Consumo API
             │                    └── Testes
             │
             └──────────────────────────────────────────────
                              │
                         Infraestrutura
                              │
                    ┌─────────┴─────────┐
                    │                   │
                  Docker              CI/CD
                    │                   │
                PostgreSQL          GitHub Actions


## 3. Usuários

### Solicitante

Funcionário que utiliza o sistema para solicitar suporte.

Pode:

* Criar chamados.
* Visualizar seus chamados.
* Adicionar informações aos chamados.
* Acompanhar o atendimento.
* Confirmar a resolução.
* Reabrir chamados quando necessário.

### Técnico

Responsável pelo atendimento dos chamados.

Pode:

* Visualizar chamados disponíveis ou atribuídos.
* Assumir chamados.
* Alterar o status do atendimento.
* Alterar a prioridade quando permitido.
* Adicionar comentários.
* Registrar a solução.
* Transferir chamados.

### Administrador

Responsável pela administração do sistema.

Pode:

* Gerenciar usuários.
* Gerenciar técnicos.
* Gerenciar categorias.
* Visualizar todos os chamados.
* Atribuir chamados.
* Administrar configurações do sistema.

## 4. Chamados

Cada chamado representa uma solicitação de suporte.

Um chamado possui, no mínimo:

* Identificador.
* Título.
* Descrição.
* Status.
* Prioridade.
* Categoria.
* Solicitante.
* Responsável.
* Data de criação.
* Data de atualização.
* Data de resolução.
* Data de encerramento.

## 5. Ciclo do chamado

O fluxo principal será:

```text
Aberto
  ↓
Em atendimento
  ↓
Resolvido
  ↓
Encerrado
```

O chamado também poderá aguardar informações do solicitante:

```text
Em atendimento
  ↓
Aguardando solicitante
  ↓
Em atendimento
```

Chamados resolvidos poderão ser reabertos caso o problema não tenha sido solucionado.

## 6. Prioridades

O sistema terá inicialmente quatro níveis:

* Baixa
* Média
* Alta
* Crítica

A prioridade poderá influenciar o atendimento e, futuramente, regras de SLA.

## 7. Categorias

Chamados serão classificados por categorias administráveis, inicialmente podendo incluir:

* Hardware
* Software
* Rede
* Acesso
* E-mail
* Impressora
* Outros

As categorias não devem depender de alterações no código para serem criadas ou modificadas.

## 8. Comunicação

Cada chamado possuirá uma conversa entre os envolvidos.

Os usuários poderão adicionar comentários ao chamado.

O sistema deverá futuramente suportar comentários internos, visíveis apenas para a equipe de atendimento.

## 9. Histórico

Alterações relevantes dos chamados deverão ser rastreáveis.

O histórico deverá registrar, entre outras ações:

* Criação do chamado.
* Alteração de status.
* Alteração de prioridade.
* Alteração de responsável.
* Transferência.
* Resolução.
* Encerramento.
* Reabertura.

Cada registro deverá permitir identificar quem realizou a ação e quando ela ocorreu.

## 10. Regras fundamentais

* Usuários só podem executar ações permitidas pelo seu papel.
* Um chamado não pode ser encerrado sem antes ser resolvido.
* Um chamado encerrado poderá ser reaberto quando necessário.
* Alterações importantes devem ser registradas no histórico.
* A mudança de estado deve respeitar as transições válidas do chamado.
* O sistema deve preservar a rastreabilidade das ações realizadas.

## 11. Evolução planejada

Após o núcleo do sistema estar estável, poderão ser adicionados:

* SLA.
* Anexos.
* Notificações.
* Notificações por e-mail.
* Equipes de atendimento.
* Dashboard e métricas.
* Busca avançada.
* Comentários internos.
* Auditoria.
* Integrações externas.

Esses recursos não fazem parte do núcleo inicial e não devem orientar a arquitetura antes que suas necessidades sejam definidas.

## 12. Princípios do projeto

* Priorizar qualidade em vez de velocidade.
* Manter regras de negócio claras e explícitas.
* Evitar complexidade sem necessidade.
* Preferir soluções extensíveis quando isso não aumentar desnecessariamente a complexidade.
* Manter responsabilidades bem separadas.
* Testar principalmente as regras de negócio.
* O sistema deve ser tratado como um produto real, não apenas como um projeto demonstrativo.
