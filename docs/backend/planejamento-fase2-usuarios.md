# Planejamento Técnico — Fase 2 Backend: Usuários

Este documento detalha as etapas de implementação do módulo de usuários no backend do CHAMAdos. Cada etapa é independente, pode ser comitada separadamente e é uma pré-condição para a Fase 3 em diante.

**Fundação disponível:**
- `UsersModule` scaffolded (controller vazio, service com `findByEmail`)
- `JwtAuthGuard` e `@CurrentUser` decorator prontos
- Schema Prisma com model `User` completo (`id`, `name`, `email`, `passwordHash`, `role`, `active`, `createdAt`, `updatedAt`)
- `AuthenticatedUser` (`id`, `email`, `role`) já tipado em `jwt.strategy.ts`

---

## Contexto de Segurança

Dois guards são necessários para proteger as rotas desta fase:

| Guard | Responsabilidade |
|---|---|
| `JwtAuthGuard` | Já existe. Valida o token e injeta `@CurrentUser`. |
| `RolesGuard` | A criar. Verifica se o `user.role` tem o nível exigido pelo `@Roles()` decorator. |

**Regra de aplica­ção dos guards:** `JwtAuthGuard` vem primeiro. `RolesGuard` consome o que o JWT já validou.

---

## Etapas

---

### Etapa 1 — ValidationPipe global + instalação do `class-validator`

**Objetivo:** Habilitar validação automática de DTOs via decorators. Pré-requisito de todas as etapas seguintes.

**Instalação:**
```bash
npm install class-validator class-transformer
```

**Alteração em `main.ts`:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,       // Remove campos não declarados no DTO silenciosamente
    forbidNonWhitelisted: true, // Rejeita requests com campos extras (400)
    transform: true,       // Converte tipos automáticamente (string → number em query params)
  }),
)
```

**Checklist:**
- [x] Instalar `class-validator` e `class-transformer`
- [x] Configurar `ValidationPipe` global no `main.ts`

---

### Etapa 2 — DTOs de entrada

**Objetivo:** Definir e validar os contratos de entrada do módulo de usuários.

**Arquivos a criar:**
```
src/users/dto/
├── create-user.dto.ts
└── update-user.dto.ts
```

**`CreateUserDto`:**
```typescript
@IsEmail()        email: string
@IsString()
@MinLength(8)     password: string
@IsString()
@IsNotEmpty()     name: string
@IsEnum(UserRole)
@IsOptional()     role?: UserRole   // padrão: USER (definido no schema)
```

**`UpdateUserDto`:** Baseado em `PartialType(CreateUserDto)`, mas **sem** `email` e `password` — estes têm fluxos próprios (não implementados agora).
```typescript
// Só permite alterar name e role
@IsString()
@IsNotEmpty()
@IsOptional()     name?: string

@IsEnum(UserRole)
@IsOptional()     role?: UserRole
```

**Segurança:** Exposição de `passwordHash` nunca deve ocorrer. Um tipo `SafeUser` será usado como retorno de todas as operações.

**Checklist:**
- [x] Criar `CreateUserDto`
- [x] Criar `UpdateUserDto`

---

### Etapa 3 — `UsersService` (CRUD completo)

**Objetivo:** Implementar a lógica de negócio do domínio de usuários, estendendo o service existente.

**Métodos a implementar:**

| Método | Operação | Observações |
|---|---|---|
| `create(dto)` | `prisma.user.create` | Hash de senha via `argon2` igual à auth |
| `findAll()` | `prisma.user.findMany` | Inclui ativos e inativos; ADMIN verá todos |
| `findById(id)` | `prisma.user.findUnique` | Lança `NotFoundException` se não encontrar |
| `findByEmail(email)` | Já existe | Manter, uso interno da `JwtStrategy` |
| `update(id, dto)` | `prisma.user.update` | Lança `NotFoundException` se não encontrar |
| `deactivate(id)` | `prisma.user.update({ active: false })` | **Soft delete**. Não remove do banco |

**Retornos — Zero vazamento de dados:**

Todas as operações retornam `SafeUser` (já definido em `auth.service.ts` como `Omit<User, 'passwordHash'>`).

> **Ponto de centralização:** O tipo `SafeUser` está em `auth.service.ts`. Deve ser **movido** para `users/users.types.ts` e reexportado de `auth.service.ts` para evitar dependência cruzada de módulos invertida (`auth` depende de `users`, não o contrário).

**Checklist:**
- [x] Mover `SafeUser` para `src/users/users.types.ts`
- [x] Atualizar import em `auth.service.ts`
- [x] Implementar `create`, `findAll`, `findById`, `update`, `deactivate`
- [x] Testes unitários: todos os métodos (sucesso e falha)

---

### Etapa 4 — `RolesGuard` e `@Roles()` decorator

**Objetivo:** Implementar autorização baseada em papel (RBAC) de forma reutilizável por todos os módulos futuros.

**Arquivos a criar:**
```
src/auth/
├── decorators/roles.decorator.ts     # @Roles('ADMIN', 'TECHNICIAN')
└── guards/roles.guard.ts             # RolesGuard
```

**`@Roles()` decorator:**
```typescript
export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
```

**`RolesGuard`:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true // Rota sem @Roles() acessível por qualquer papel autenticado

    const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>()
    return requiredRoles.includes(user.role)
  }
}
```

**Uso esperado no controller:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Post()
create(@Body() dto: CreateUserDto) { ... }
```

**Checklist:**
- [x] Criar `roles.decorator.ts`
- [x] Criar `roles.guard.ts`
- [x] Teste unitário do `RolesGuard` (role compatível, role incompatível, sem `@Roles`)

---

### Etapa 5 — `UsersController` (endpoints REST)

**Objetivo:** Expor as operações do `UsersService` via HTTP com as devidas proteções.

**Endpoints:**

| Método | Rota | Guards | Observações |
|---|---|---|---|
| `POST /users` | Criar usuário | `Jwt` + `Roles(ADMIN)` | Corpo: `CreateUserDto` |
| `GET /users` | Listar usuários | `Jwt` + `Roles(ADMIN)` | Retorna `SafeUser[]` |
| `GET /users/:id` | Buscar por ID | `Jwt` + `Roles(ADMIN)` ou `@CurrentUser` | ADMIN ou o próprio usuário |
| `PATCH /users/:id` | Atualizar | `Jwt` + `Roles(ADMIN)` | Corpo: `UpdateUserDto` |
| `DELETE /users/:id` | Desativar | `Jwt` + `Roles(ADMIN)` | Retorna `204 No Content` |

**Regra do `GET /users/:id`:** O usuário pode buscar o próprio perfil. ADMIN pode buscar qualquer. Caso contrário: `403 Forbidden`.

**Regra de auto-proteção:** ADMIN não pode desativar a si mesmo. Se `dto.id === currentUser.id` → `400 Bad Request`.

**Checklist:**
- [ ] Implementar todos os 5 endpoints
- [ ] Aplicar guards corretamente por endpoint
- [ ] Aplicar regra de auto-proteção no `DELETE /users/:id`

---

## Ordem de execução recomendada

```
Etapa 1 (ValidationPipe) → Etapa 2 (DTOs) → Etapa 3 (Service) → Etapa 4 (RolesGuard) → Etapa 5 (Controller)
```

As etapas 1–4 são infraestrutura. A Etapa 5 é superfície e depende de todas as anteriores.

---

## Critérios de conclusão da Fase 2 (Backend)

- [ ] ADMIN cria, edita e desativa usuários via API
- [ ] Usuário não-ADMIN recebe `403` ao tentar acessar endpoints de usuários
- [ ] `GET /users/:id` retorna o perfil ao próprio usuário autenticado
- [ ] `passwordHash` nunca aparece nas respostas da API
- [ ] ADMIN não consegue se auto-desativar (`400`)
- [ ] Testes unitários: `UsersService`, `RolesGuard` todos passando
