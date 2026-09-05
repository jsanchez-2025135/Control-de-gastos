/**
 * Entidad "Income". Representa una fila de la tabla "incomes".
 */
export type IncomeType = 'Fijo' | 'Variable';

export interface Income {
  id: string;
  userId: string;
  title: string;
  type: IncomeType;
  category: string;
  amount: number;
  method: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}