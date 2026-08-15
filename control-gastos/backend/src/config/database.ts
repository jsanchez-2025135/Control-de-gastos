/**
 * Módulo de conexión a base de datos.
 *
 * HOY: no hay conexión real, todo se sirve desde arreglos en memoria (mock).
 * SIGUIENTE SPRINT: aquí se instanciará el pool de PostgreSQL (pg) o el cliente
 * de un ORM (TypeORM / Prisma) SIN que el resto de la app tenga que cambiar,
 * porque los "services" nunca hablan con la base de datos directamente:
 * siempre pasan por un Repository (ver shared/interfaces + los *.repository.ts
 * que se crearán en cada módulo).
 *
 * Ejemplo de cómo quedaría con "pg" (comentado a propósito):
 *
 * import { Pool } from 'pg';
 * import { env } from './env';
 *
 * export const pool = new Pool({
 *   host: env.db.host,
 *   port: env.db.port,
 *   database: env.db.name,
 *   user: env.db.user,
 *   password: env.db.password,
 * });
 *
 * export const connectDatabase = async (): Promise<void> => {
 *   await pool.query('SELECT 1');
 *   console.log('✅ Conectado a PostgreSQL');
 * };
 */

export const connectDatabase = async (): Promise<void> => {
  // Placeholder: se activa cuando conectemos PostgreSQL.
  console.log('ℹ️  Base de datos no configurada todavía (usando datos mock en memoria).');
};
