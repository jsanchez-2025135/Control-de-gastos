# Control de Gastos — Monorepo (pnpm workspaces)

Proyecto de práctica: **Login con JWT** (roles `admin` / `user`) sobre una arquitectura
por capas, lista para escalar al módulo de gastos y para conectar PostgreSQL sin
reestructurar nada.

```
control-gastos/
├── package.json          # workspace raíz
├── pnpm-workspace.yaml
├── backend/               # Node + TypeScript + Express
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── env.ts
│       │   └── database.ts        # placeholder listo para PostgreSQL
│       ├── shared/
│       │   ├── interfaces/
│       │   └── utils/
│       └── modules/
│           ├── auth/
│           │   ├── controllers/auth.controller.ts
│           │   ├── services/auth.service.ts
│           │   ├── services/token.service.ts
│           │   ├── models/user.model.ts
│           │   ├── models/user.mock.ts
│           │   ├── models/user.repository.ts   # abstracción repo (mock hoy, PG mañana)
│           │   ├── middlewares/auth.middleware.ts
│           │   ├── middlewares/role.middleware.ts
│           │   └── routes/auth.routes.ts
│           └── expense/
│               ├── controllers/expense.controller.ts
│               ├── services/expense.service.ts
│               ├── models/expense.model.ts
│               └── routes/expense.routes.ts
└── front/                 # Angular 18 (standalone components)
    └── src/app/
        ├── app.config.ts
        ├── app.routes.ts
        ├── core/
        │   ├── services/auth.service.ts
        │   ├── guards/auth.guard.ts
        │   ├── interceptors/auth.interceptor.ts
        │   └── models/
        └── features/
            ├── auth/login/       # LoginComponent (Reactive Forms)
            └── dashboard/        # Placeholder: mensaje de éxito post-login
```

> Nota sobre `app.ts` / `server.ts`: se ubicaron en `src/` (no dentro de `src/modules/`)
> porque son el punto de arranque de TODA la app, no de un módulo específico. Meterlos
> dentro de `modules/` mezclaría la infraestructura del servidor con la lógica de negocio
> de un dominio, rompiendo la separación por capas que pide el patrón (Router → Controller
> → Service → Repository/Model).

## 1. Instalación (pnpm únicamente)

Desde la **raíz** `control-gastos/`:

```bash
pnpm install
```

Esto instala las dependencias de `backend` y `front` porque están declarados en
`pnpm-workspace.yaml`.

Si prefieres instalar por separado / agregar algo nuevo:

```bash
# Backend
pnpm --filter backend add express cors dotenv jsonwebtoken bcrypt
pnpm --filter backend add -D typescript tsx @types/express @types/cors @types/node @types/jsonwebtoken @types/bcrypt

# Frontend
pnpm --filter front add @angular/animations @angular/common @angular/compiler @angular/core @angular/forms @angular/platform-browser @angular/platform-browser-dynamic @angular/router rxjs tslib zone.js
pnpm --filter front add -D @angular-devkit/build-angular @angular/cli @angular/compiler-cli typescript
```

## 2. Variables de entorno (backend)

```bash
cp backend/.env.example backend/.env
```

## 3. Ejecutar en desarrollo

```bash
# Backend -> http://localhost:3000
pnpm --filter backend dev

# Frontend -> http://localhost:4200
pnpm --filter front start
```

(O desde la raíz: `pnpm run dev:backend` / `pnpm run dev:front`.)

## 4. Probar el login

Usuarios mock (contraseñas ya hasheadas con bcrypt, nunca en texto plano):

| Rol   | Email                     | Password   |
|-------|----------------------------|-----------|
| admin | admin@controlgastos.com    | Admin123! |
| user  | user@controlgastos.com     | User123!  |

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@controlgastos.com","password":"Admin123!"}'
```

Desde Angular: entra a `http://localhost:4200/login`, ingresa esas credenciales y
serás redirigido a `/dashboard`, donde por ahora solo se muestra el mensaje de
éxito (nombre y rol), porque el dashboard real aún no está diseñado.

## 5. Cómo se conectará PostgreSQL (siguiente sprint) sin romper esta estructura

El patrón usado es **Controller → Service → Repository**. Los `Service` (p. ej.
`AuthService`) **nunca** hablan directo con una base de datos: dependen de una
interfaz (`IUserRepository`, en `backend/src/modules/auth/models/user.repository.ts`).

Hoy esa interfaz la implementa `InMemoryUserRepository` (el mock). Para pasar a
PostgreSQL, los pasos son:

1. `pnpm --filter backend add pg` (o `prisma` / `typeorm` si se prefiere ORM).
2. Completar `backend/src/config/database.ts` (ya tiene el `Pool` de `pg` comentado
   y listo para descomentar).
3. Crear `PostgresUserRepository implements IUserRepository` en el mismo archivo
   `user.repository.ts` (o uno nuevo), con las queries SQL reales.
4. Cambiar una sola línea:
   ```ts
   export const userRepository: IUserRepository = new PostgresUserRepository();
   ```
5. Nada en `AuthService`, `AuthController` ni en las rutas cambia, porque todos
   dependen de la interfaz `IUserRepository`, no de la implementación concreta.

El mismo patrón se replica para `expense` cuando se implemente su repositorio.

## 6. Patrón de diseño usado

**Arquitectura en capas (Layered Architecture)** con **Repository Pattern**:

`Route → Controller → Service → Repository → (Mock hoy / PostgreSQL mañana)`

- **Route**: solo define el endpoint y qué middlewares aplican.
- **Controller**: recibe/valida forma de la request, delega y responde.
- **Service**: lógica de negocio (comparar password, generar token, reglas).
- **Repository**: acceso a datos, intercambiable sin tocar las capas de arriba.

Esto hace la app **escalable**: cada módulo (`auth`, `expense`, y los que sigan)
es independiente y sigue la misma receta.
