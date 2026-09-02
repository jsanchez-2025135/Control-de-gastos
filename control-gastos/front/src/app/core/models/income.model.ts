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

export interface IncomeSummary {
  incomes: Income[];
  totalIngresos: number;
  totalFixed: number;
  totalVariable: number;
  count: number;
}

export interface CreateIncomePayload {
  title: string;
  type: IncomeType;
  category: string;
  amount: number;
  method: string;
  date: string;
}

export type UpdateIncomePayload = CreateIncomePayload;