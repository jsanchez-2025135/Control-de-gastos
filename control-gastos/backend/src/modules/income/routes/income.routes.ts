import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller';
import { authMiddleware } from '../../auth/middlewares/auth.middleware';

const router = Router();

// GET  /api/incomes  -> lista + totales del usuario autenticado
router.get('/', authMiddleware, IncomeController.list);

// POST /api/incomes  -> registra un nuevo ingreso
router.post('/', authMiddleware, IncomeController.create);

// PUT  /api/incomes/:id  -> edita un ingreso existente del usuario autenticado
router.put('/:id', authMiddleware, IncomeController.update);

// DELETE /api/incomes/:id  -> elimina un ingreso del usuario autenticado
router.delete('/:id', authMiddleware, IncomeController.remove);

export default router;