import { pool } from '@config/database';
import { Income, IncomeType } from './income.model';

export interface CreateIncomeInput {
  userId: string;
  title: string;
  type: IncomeType;
  category: string;
  amount: number;
  method: string;
  date: string;
}

export type UpdateIncomeInput = Omit<CreateIncomeInput, 'userId'>;

export interface IIncomeRepository {
  findAllByUser(userId: string): Promise<Income[]>;
  findByIdAndUser(id: string, userId: string): Promise<Income | null>;
  create(input: CreateIncomeInput): Promise<Income>;
  update(id: string, userId: string, input: UpdateIncomeInput): Promise<Income | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

const mapRow = (row: any): Income => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  type: row.type,
  category: row.category,
  amount: Number(row.amount),
  method: row.method,
  date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
  createdAt: row.created_at,
});

export class PostgresIncomeRepository implements IIncomeRepository {
  async findAllByUser(userId: string): Promise<Income[]> {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, type, category, amount, method, date, created_at
       FROM incomes WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
      [userId],
    );
    return rows.map(mapRow);
  }

  async create(input: CreateIncomeInput): Promise<Income> {
    const { rows } = await pool.query(
      `INSERT INTO incomes (user_id, title, type, category, amount, method, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, type, category, amount, method, date, created_at`,
      [input.userId, input.title, input.type, input.category, input.amount, input.method, input.date],
    );
    return mapRow(rows[0]);
  }

  async findByIdAndUser(id: string, userId: string): Promise<Income | null> {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, type, category, amount, method, date, created_at
       FROM incomes WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  // El WHERE incluye user_id para que un usuario nunca pueda editar el ingreso de otro,
  // aunque adivine el id.
  async update(id: string, userId: string, input: UpdateIncomeInput): Promise<Income | null> {
    const { rows } = await pool.query(
      `UPDATE incomes
       SET title = $1, type = $2, category = $3, amount = $4, method = $5, date = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, user_id, title, type, category, amount, method, date, created_at`,
      [input.title, input.type, input.category, input.amount, input.method, input.date, id, userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(`DELETE FROM incomes WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const incomeRepository: IIncomeRepository = new PostgresIncomeRepository();