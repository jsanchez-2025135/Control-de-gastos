/**
 * Módulo de conexión a base de datos (PostgreSQL vía "pg", sin ORM).
 *
 * Expone un Pool único que reutiliza toda la app. Los repositorios
 * (ej. PostgresUserRepository) importan `pool` y ejecutan sus queries ahí.
 */
import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reintenta la conexión unas veces antes de rendirse: el "predev" recién
 * mandó arrancar el servicio de PostgreSQL en Windows y puede tardar
 * uno o dos segundos en aceptar conexiones.
 */
export const connectDatabase = async (retries = 5, delayMs = 1500): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        console.log('✅ Conectado a PostgreSQL');
        return;
      } finally {
        client.release();
      }
    } catch (error) {
      const isLastAttempt = attempt === retries;
      console.log(
        `⏳ Intento ${attempt}/${retries} fallido al conectar a PostgreSQL${isLastAttempt ? '' : ', reintentando...'}`,
      );
      if (isLastAttempt) {
        throw error;
      }
      await wait(delayMs);
    }
  }
};
