import { Request, Response, NextFunction } from 'express';
import { forbidden } from '@shared/utils/http-response';
import { Role } from '../models/user.model';

/**
 * Middleware de autorización por rol.
 * Uso: router.get('/admin-only', authMiddleware, roleMiddleware(['admin']), handler)
 * Debe ir SIEMPRE después de authMiddleware, porque depende de req.user.
 */
export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return forbidden(res, 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};
