/**
 * Arranca el servicio de PostgreSQL en Windows (si no está corriendo)
 * antes de levantar el backend. En otros sistemas operativos no hace nada,
 * porque ahí PostgreSQL normalmente ya corre como daemon/servicio del OS.
 *
 * Requiere:
 *  - Ejecutar la terminal (o VS Code) como Administrador, porque "net start"
 *    necesita permisos elevados en Windows.
 *  - La variable PG_SERVICE_NAME en tu .env con el nombre exacto del servicio
 *    (lo ves en services.msc, ej: "postgresql-x64-16").
 *
 * Si algo falla, NO detiene el arranque del backend: solo avisa en consola,
 * porque quizá ya tienes Postgres corriendo por otro medio.
 */
const { execSync } = require('child_process');
require('dotenv').config();

if (process.platform !== 'win32') {
  process.exit(0);
}

const serviceName = process.env.PG_SERVICE_NAME;

if (!serviceName) {
  console.log(
    'ℹ️  PG_SERVICE_NAME no está definido en tu .env; no se intentará arrancar PostgreSQL automáticamente.\n' +
    '   Súbelo con el nombre de tu servicio (ver services.msc), ej: PG_SERVICE_NAME=postgresql-x64-16',
  );
  process.exit(0);
}

try {
  execSync(`net start "${serviceName}"`, { stdio: 'pipe' });
  console.log(`✅ Servicio de PostgreSQL "${serviceName}" iniciado.`);
} catch (error) {
  const output = (error.stdout?.toString() || '') + (error.stderr?.toString() || '');

  if (/ya se ha iniciado|already.*started|already been started/i.test(output)) {
    console.log(`ℹ️  El servicio "${serviceName}" ya estaba corriendo.`);
  } else {
    console.warn(
      `⚠️  No se pudo iniciar el servicio "${serviceName}" automáticamente.\n` +
      '   Verifica que: (1) el nombre en PG_SERVICE_NAME sea exacto, ' +
      '(2) estés corriendo la terminal como Administrador.\n' +
      `   Detalle: ${output.trim() || error.message}`,
    );
  }
}
