# AD-001 — Arquitetura Feature-Based

**Decisão:** O frontend do CHAMAdos será organizado por feature de negócio, não por tipo técnico de arquivo.

## Estrutura

```text
src/
├── app/                  # Infraestrutura da aplicação
│   ├── layouts/          # Layouts de página compartilhados
│   ├── providers/        # Provedores globais (contextos, queries, tema)
│   └── router/           # Configuração de rotas
├── components/
│   └── ui/               # Componentes de UI reutilizáveis entre features
├── features/             # Features de negócio (ver abaixo)
├── shared/               # Utilitários e tipos transversais
└── lib/                  # Configurações de bibliotecas externas
```

### Organização de uma feature

Cada feature vive em seu próprio diretório dentro de `features/`:

```text
features/
└── tickets/
    ├── components/       # Componentes específicos da feature
    ├── hooks/            # Hooks de estado e lógica da feature
    ├── services/         # Chamadas de API relacionadas
    └── types/            # Tipos TypeScript da feature
```

## Motivos

- Manter código relacionado ao mesmo contexto de negócio próximo.
- Evitar dependências cruzadas desnecessárias entre features.
- Facilitar a localização de código para desenvolvimento e manutenção.
- Tornar a estrutura autoexplicativa para novos colaboradores.
- Alinhar o frontend com a organização por domínio adotada no backend.

## Consequência

- Componentes e hooks específicos de uma feature não devem ser expostos globalmente.
- Apenas código genuinamente reutilizável entre múltiplas features deve ir para `components/` ou `shared/`.
- Novos recursos devem ser criados como nova feature em `features/`, não como tipos ou componentes avulsos na raiz.
