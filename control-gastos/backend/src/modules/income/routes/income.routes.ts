import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller';
import { authMiddleware } from '../../auth/middlewares/auth.middleware';

const router = Router();

// GET  /api/incomes  -> lista + totales del usuario autenticado
router.get('/', authMiddleware, IncomeController.list);

// POST /api/incomes  -> registra un nuevo ingreso
router.post('/', authMiddleware, IncomeController.create);

export default router;