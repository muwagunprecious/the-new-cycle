-- Drop default, alter type, and recreate default for role column
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"Role";
