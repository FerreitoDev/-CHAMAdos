# AD-001 — Organização por domínio

**Decisão:** O backend será organizado por domínio de negócio, separando as responsabilidades de cada domínio em camadas próprias.

## Estrutura

Cada domínio poderá possuir:

- `application/` — casos de uso e orquestração da aplicação.
- `domain/` — regras e conceitos centrais do negócio.
- `infrastructure/` — implementação de dependências externas, como persistência e integrações.

## Exemplo

```text
tickets/
├── application/
├── domain/
└── infrastructure/
```

## Motivos

- Manter responsabilidades relacionadas próximas.
- Evitar espalhar arquivos do mesmo domínio pela aplicação.
- Facilitar testes e manutenção.
- Permitir que cada domínio evolua de forma independente.
- Tornar a estrutura mais clara para desenvolvimento humano e agentes de IA.

## Consequência

Novos recursos devem ser associados ao domínio correspondente em vez de serem organizados apenas pelo tipo técnico do arquivo.
A separação em ``application``, ``domain`` e ``infrastructure`` deve ser utilizada quando houver responsabilidade suficiente para justificar a separação, evitando criar abstrações vazias ou desnecessárias.