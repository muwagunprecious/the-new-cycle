-- Add core missing columns to "users" table for Go-cycle

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT DEFAULT 'Unknown User';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT DEFAULT '';

-- We need to check if the 'Role' enum exists, and if so add it
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "role" "Role" DEFAULT 'USER';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
