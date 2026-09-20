# Planejamento Técnico — Fase 3 Backend: Categorias

Este documento detalha as etapas de implementação do módulo de categorias no backend do **CHAMAdos**. Cada etapa é independente, testável e pode ser comitada separadamente.

**Fundação disponível:**
- Schema Prisma com model `Category` completo (`id`, `name`, `description`, `active`, `createdAt`, `updatedAt`, `tickets`)
- Security Context pronto: `JwtAuthGuard`, `RolesGuard`, `@Roles()` e `@CurrentUser()`
- `ValidationPipe` global configurado em `main.ts`

---

## Regras de Negócio e Segurança

1. **Acesso por Papel (RBAC)**:
   - **Criar, Editar e Desativar**: Exclusivo para usuários com papel `ADMIN`.
   - **Consultar Categorias**: Acesso permitido a todos os usuários autenticados (`USER`, `TECHNICIAN`, `ADMIN`).
2. **Listagem e Filtro de Inativas**:
   - Usuários comuns e técnicos visualizam apenas categorias **ativas** (`active = true`).
   - Administradores (`ADMIN`) podem listar todas as categorias ativas e inativas (via query param `?includeInactive=true`).
3. **Desativação Lógica (Soft Delete)**:
   - Categorias nunca são excluídas fisicamente do banco de dados para não quebrar a integridade dos chamados históricos.
   - O endpoint `DELETE /categories/:id` altera `active = false`.
4. **Unicidade de Nome**:
   - O campo `name` é único no banco. Se tentar criar ou renomear para um nome já existente, o service deve capturar a duplicidade e lançar `ConflictException` (409).

---

## Estrutura do Módulo

```text
backend/src/categories/
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
├── categories.module.ts
├── categories.service.ts
├── categories.service.spec.ts
├── categories.controller.ts
└── categories.controller.spec.ts
```

---

## Etapas de Implementação

---

### Etapa 1 — DTOs de Entrada (`CreateCategoryDto` e `UpdateCategoryDto`)

**Objetivo:** Definir e validar as regras dos contratos de entrada da API de categorias.

**Arquivos a criar:**
```
src/categories/dto/
├── create-category.dto.ts
└── update-category.dto.ts
```

**`CreateCategoryDto`:**
```typescript
@IsString()
@IsNotEmpty()
name: string;

@IsString()
@IsOptional()
description?: string;
```

**`UpdateCategoryDto`:**
```typescript
@IsString()
@IsNotEmpty()
@IsOptional()
name?: string;

@IsString()
@IsOptional()
description?: string;

@IsBoolean()
@IsOptional()
active?: boolean;
```

**Checklist:**
- [x] Criar `CreateCategoryDto` com validações `class-validator`
- [x] Criar `UpdateCategoryDto` com validações `class-validator`

---

### Etapa 2 — `CategoriesService` (CRUD Completo e Regras de Negócio)

**Objetivo:** Implementar a lógica de negócio do domínio de categorias.

**Métodos a implementar:**

| Método | Operação | Observações |
|---|---|---|
| `create(dto)` | `prisma.category.create` | Lança `ConflictException` se `name` já existir |
| `findAll(includeInactive?)` | `prisma.category.findMany` | Se `includeInactive` for `false`, filtra por `active: true`. Ordena por `name asc` |
| `findById(id)` | `prisma.category.findUnique` | Lança `NotFoundException` se não encontrar |
| `update(id, dto)` | `prisma.category.update` | Lança `NotFoundException` se não encontrar e `ConflictException` se o novo nome já estiver em uso |
| `deactivate(id)` | `prisma.category.update({ active: false })` | Soft delete. Lança `NotFoundException` se não encontrar |

**Checklist:**
- [x] Criar `CategoriesService` com injeção do `PrismaService`
- [x] Implementar `create`, `findAll`, `findById`, `update` e `deactivate`
- [x] Testes unitários do `CategoriesService` (`categories.service.spec.ts`) cobrindo todos os métodos (sucesso, erro de não encontrado e duplicidade)

---

### Etapa 3 — `CategoriesController` (Endpoints REST)

**Objetivo:** Expor as operações do `CategoriesService` via HTTP com as devidas proteções.

**Endpoints:**

| Método | Rota | Guards / Permissão | Observações |
|---|---|---|---|
| `POST /categories` | Criar categoria | `Jwt` + `Roles(ADMIN)` | Recebe `CreateCategoryDto`, retorna `201 Created` |
| `GET /categories` | Listar categorias | `Jwt` (Todos autenticados) | Suporta `?includeInactive=true` (somente se `ADMIN`) |
| `GET /categories/:id` | Buscar por ID | `Jwt` (Todos autenticados) | Retorna a categoria ou `404 Not Found` |
| `PATCH /categories/:id` | Atualizar | `Jwt` + `Roles(ADMIN)` | Recebe `UpdateCategoryDto`, retorna `200 OK` |
| `DELETE /categories/:id` | Desativar | `Jwt` + `Roles(ADMIN)` | Retorna `204 No Content` |

**Checklist:**
- [x] Criar `CategoriesController` com decorators e guards adequados
- [x] Implementar os 5 endpoints HTTP
- [x] Registrar `CategoriesModule` no `AppModule`
- [x] Testes unitários do `CategoriesController` (`categories.controller.spec.ts`) cobrindo todas as rotas e autorizações RBAC

---

### Etapa 4 — Seed de Categorias Iniciais no Banco de Dados

**Objetivo:** Popular o PostgreSQL com as categorias generalistas padrão do sistema.

**Categorias padrão a cadastrar:**
1. Hardware (Problemas com componentes físicos, computadores, monitores)
2. Software (Instalação, falhas em programas e licenças)
3. Rede e Conectividade (Problemas de internet, Wi-Fi, VPN)
4. Controle de Acesso (Senhas, permissões e contas de usuários)
5. E-mail e Comunicação (Falhas no envio/recebimento de e-mails, Teams/Slack)
6. Impressoras e Periféricos (Impressoras, scanners, mouses, teclados)
7. Outros (Solicitações e dúvidas gerais)

**Arquivos a criar/modificar:**
```
prisma/
└── seed.ts                  # Script Prisma Seed com as categorias iniciais
package.json                 # Adicionar chave "prisma": { "seed": "tsx prisma/seed.ts" }
```

**Checklist:**
- [ ] Criar `prisma/seed.ts` usando `PrismaClient` com `upsert` para idempotent execução
- [ ] Configurar o comando de seed no `package.json`
- [ ] Validar a execução do seed (`npx prisma db seed`)

---

## Critérios de Conclusão da Fase 3 (Backend)

- [ ] ADMIN cria, edita e desativa categorias via API
- [ ] Usuários comuns e técnicos visualizam apenas categorias ativas
- [ ] Nomes duplicados de categorias são rejeitados com `409 Conflict`
- [ ] `DELETE /categories/:id` realiza desativação lógica (`active: false`)
- [ ] Script de seed cadastra as 7 categorias padrão sem duplicar em reexecuções
- [ ] Testes unitários do `CategoriesService` e `CategoriesController` passando 100% verdes
