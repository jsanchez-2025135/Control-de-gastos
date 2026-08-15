/**
 * Entidad "User".
 * Cuando conectemos PostgreSQL, esta misma interfaz representará
 * la fila de la tabla "users" (con TypeORM/Prisma se reutiliza igual).
 */
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hash (bcrypt), nunca texto plano
  role: Role;
}

/** Versión segura del usuario, sin password, para devolver al cliente. */
export type SafeUser = Omit<User, 'password'>;
