/**
 * Crea la base de datos (si no existe) y aplica las migraciones SQL
 * de la carpeta /sql, en orden, antes de levantar el backend.
 *
 * Se conecta primero a la base "postgres" (la que siempre existe en
 * cualquier instalación) para poder crear la base del proyecto.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};
const dbName = process.env.DB_NAME || 'control_gastos';

async function ensureDatabaseExists() {
  const client = new Client({ ...config, database: 'postgres' });
  await client.connect();

  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

  if (rows.length === 0) {
    // No se puede parametrizar el nombre en CREATE DATABASE, así que se valida
    // que solo tenga caracteres seguros antes de interpolarlo.
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(`DB_NAME "${dbName}" tiene caracteres no permitidos.`);
    }
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Base de datos "${dbName}" creada.`);
  } else {
    console.log(`ℹ️  La base de datos "${dbName}" ya existía.`);
  }

  await client.end();
}

async function runMigrations() {
  const sqlDir = path.join(__dirname, '..', 'sql');
  if (!fs.existsSync(sqlDir)) return;

  const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();
  if (files.length === 0) return;

  const client = new Client({ ...config, database: dbName });
  await client.connect();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    await client.query(sql);
    console.log(`✅ Migración aplicada: ${file}`);
  }

  await client.end();
}

(async () => {
  try {
    await ensureDatabaseExists();
    await runMigrations();
  } catch (error) {
    console.warn(
      '⚠️  No se pudo crear/migrar la base de datos automáticamente.\n' +
      `   Detalle: ${error.message}\n` +
      '   Verifica DB_USER/DB_PASSWORD en tu .env. El backend intentará arrancar igual.',
    );
  }
})();
