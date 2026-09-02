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

export interface IIncomeRepository {
  findAllByUser(userId: string): Promise<Income[]>;
  create(input: CreateIncomeInput): Promise<Income>;
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
}

export const incomeRepository: IIncomeRepository = new PostgresIncomeRepository();