# AD-002 — Estratégia de Testes do Frontend

**Decisão:** O frontend do CHAMAdos utilizará Vitest como executor de testes, Testing Library para testes de componentes React e jsdom como ambiente de DOM.

## Motivos

- Integração direta com o ecossistema Vite.
- Permitir testes de componentes React baseados no comportamento observado pelo usuário.
- Evitar acoplamento dos testes à implementação interna dos componentes.
- Manter a infraestrutura de testes simples e adequada ao escopo atual do projeto.
- Permitir expansão futura da cobertura de testes sem substituir a infraestrutura inicial.

## Tecnologias

- **Vitest:** execução dos testes.
- **Testing Library:** renderização e interação com componentes React.
- **jest-dom:** asserções específicas para DOM.
- **user-event:** simulação de interações do usuário.
- **jsdom:** ambiente de navegador utilizado durante os testes.

## Organização

Os testes serão mantidos na pasta:

```text
tests/