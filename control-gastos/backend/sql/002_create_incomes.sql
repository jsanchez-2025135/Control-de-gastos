-- Se aplica automáticamente al correr "pnpm dev" (scripts/init-db.cjs recorre /sql en orden)

CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Fijo', 'Variable')),
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);