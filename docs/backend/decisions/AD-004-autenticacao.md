# AD-004 — Estratégia de Autenticação

**Decisão:** O sistema utilizará autenticação baseada em JWT com access token de curta duração e refresh token armazenado em cookie HttpOnly.

## Mecanismo

### Access Token

- Formato: JWT assinado com `HS256`
- Expiração: `15 minutos`
- Payload: `{ sub: userId, email, role }`
- Transporte: `Authorization: Bearer <token>` no header de cada requisição

### Refresh Token

- Formato: string aleatória (`crypto.randomBytes`)
- Expiração: `7 dias`
- Armazenamento no cliente: cookie `HttpOnly`, `Secure` (em produção), `SameSite=Strict`
- Armazenamento no servidor: **apenas o hash** do token no banco de dados (nunca o valor em texto puro)
- O hash utiliza a mesma biblioteca de hash de senha (`argon2id`)

### Hash de senhas

- Biblioteca: `argon2` (variant: `argon2id`)
- Configuração padrão da biblioteca (memory: 65536, iterations: 3, parallelism: 4)

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autentica com email e senha. Retorna access token no body e refresh token em cookie |
| `POST` | `/auth/refresh` | Lê refresh token do cookie, valida o hash, retorna novo access token |
| `POST` | `/auth/logout` | Invalida o refresh token no banco e limpa o cookie |

## Fluxo

```text
1. Cliente envia POST /auth/login com { email, senha }
2. Servidor verifica senha com argon2.verify
3. Servidor gera access token (JWT, 15min) e refresh token (random, 7d)
4. Servidor persiste hash(refreshToken) no banco associado ao userId
5. Servidor retorna:
   - body: { accessToken }
   - Set-Cookie: refreshToken=<valor>; HttpOnly; Secure; SameSite=Strict

6. Cliente usa accessToken no header Authorization para requisições
7. Quando accessToken expira (401), cliente envia POST /auth/refresh
8. Servidor lê cookie, verifica hash, emite novo accessToken
9. No logout: servidor apaga o hash do banco e limpa o cookie
```

## Modelo de banco

A entidade `RefreshToken` será adicionada ao schema Prisma:

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

> O campo `User` precisará de `refreshTokens RefreshToken[]`.

## Cookie em diferentes ambientes

| Atributo | Desenvolvimento | Produção |
|---|---|---|
| `HttpOnly` | sim | sim |
| `Secure` | não | sim |
| `SameSite` | `Strict` | `Strict` |
| `Path` | `/auth` | `/auth` |

A flag `Secure` é controlada pela variável de ambiente `NODE_ENV`.

## Fora do escopo inicial

- Múltiplos dispositivos simultâneos com controle de sessão por dispositivo
- Rotação automática de refresh token (refresh token rotation)
- Revogação em massa (ex: logout de todos os dispositivos)

Esses recursos poderão ser adicionados sem alterar a arquitetura base, pois o refresh token já é armazenado no banco.

## Motivos

- Cookie HttpOnly elimina o risco de roubo de token via XSS.
- Armazenar apenas o hash no banco protege os tokens em caso de vazamento do banco de dados.
- Access token de curta duração limita a janela de exposição em caso de interceptação.
- Argon2id é a recomendação atual do OWASP para hash de senhas e tokens críticos.
- Manter o refresh token no banco permite invalidação explícita no logout.
