import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes/auth.routes';

/**
 * Configuración de la aplicación Express: middlewares globales y montaje
 * de rutas de cada módulo. Separado de server.ts para poder testear "app"
 * sin necesidad de levantar un puerto real (supertest, etc).
 */
const app: Application = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API Control de Gastos funcionando' });
});

// Rutas por módulo (por ahora solo Auth; "expense" se agregará en otra entrega)
app.use('/api/auth', authRoutes);

export default app;
