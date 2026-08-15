import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

/**
 * Punto de entrada del proceso Node. Levanta el servidor HTTP.
 */
const startServer = async () => {
  await connectDatabase(); // hoy no hace nada real; listo para PostgreSQL

  app.listen(env.port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${env.port}`);
  });
};

startServer();
