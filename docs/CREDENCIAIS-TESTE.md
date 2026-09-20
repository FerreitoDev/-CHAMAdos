# 🔐 Credenciais de Testes e Desenvolvimento — CHAMAdos

Este documento lista as contas genéricas padrão pré-configuradas no script de seed do banco de dados (`backend/prisma/seed.ts`).

---

## 🔑 Contas Pré-cadastradas

| Papel (Role) | Nome | E-mail | Senha | Acesso / Permissões |
|---|---|---|---|---|
| **ADMIN** | Administrador de Teste | `admin@chamados.local` | `AdminPassword123!` | Gestão completa (Usuários, Categorias, Configurações, Todos os chamados) |
| **TECHNICIAN** | Técnico de Teste | `tecnico@chamados.local` | `TecnicoPassword123!` | Atendimento de chamados (Ver chamados pendentes, Assumir, Resolver) |
| **USER** | Usuário de Teste | `usuario@chamados.local` | `UsuarioPassword123!` | Solicitante (Abertura e acompanhamento dos próprios chamados) |

---

## 🚀 Como Popular no Banco de Dados

Para cadastrar ou resetar essas contas e as categorias padrão no ambiente local:

```bash
cd backend
npx prisma db seed
```

---

## 🔒 Segurança

> **Aviso:** Estas credenciais são estritamente para desenvolvimento e testes locais. Nunca utilize estes e-mails e senhas em ambiente de produção.
