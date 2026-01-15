-- Run this SQL in your Supabase SQL Editor
-- This creates an admin user with email: admin@gmail.com and password: admin123

INSERT INTO "User" (id, email, name, password, role, image, cart)
VALUES (
  'user_admin_seed',
  'admin@gmail.com',
  'System Admin',
  '$2b$10$w5jtk/rV3lJLPK6S8sO5cOgO1IGY6br1b.rzr',
  'ADMIN',
  '',
  '{}'::jsonb
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'ADMIN',
  password = EXCLUDED.password;

-- Verify the admin was created
SELECT id, email, name, role FROM "User" WHERE email = 'admin@gmail.com';
