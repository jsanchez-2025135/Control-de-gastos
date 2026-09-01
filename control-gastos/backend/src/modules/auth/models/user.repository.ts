import { pool } from '../../../config/database';
import { User } from './user.model';

/**
 * Repositorio de usuarios.
 *
 * PostgresUserRepository consulta la tabla "users" real vía "pg" (sin ORM).
 * El AuthService solo depende de "IUserRepository", nunca de esta clase
 * directamente, así que este es el único archivo que cambia si en el futuro
 * se migra a un ORM.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export class PostgresUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT id, name, email, password, role FROM users WHERE id = $1 LIMIT 1',
      [id],
    );
    return rows[0] ?? null;
  }
}

// Instancia que se inyecta en el AuthService.
export const userRepository: IUserRepository = new PostgresUserRepository();
