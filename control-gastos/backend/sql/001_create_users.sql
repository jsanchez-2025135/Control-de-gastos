-- Ejecutar con: psql -U postgres -d control_gastos -f sql/001_create_users.sql
-- (o el usuario/base que tengas definidos en tu .env)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- hash bcrypt
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Necesario para gen_random_uuid() en versiones donde no viene por defecto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Mismos usuarios/hashes que estaban en el mock, para que sigas probando igual.
-- Admin -> admin@controlgastos.com | Admin123!
-- User  -> user@controlgastos.com  | User123!
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador General', 'admin@controlgastos.com', '$2b$10$ugyVrrMofsdd5lXfNYFAvurhyiMeKiXJysk.SG0/4FNIxluLCtGgO', 'admin'),
  ('Usuario Estándar', 'user@controlgastos.com', '$2b$10$aGpvtViywlA26AMIj9pXleVQduA5hxrKLNmkxy.pyaJUcFuH0V5Ki', 'user')
ON CONFLICT (email) DO NOTHING;
