-- Fix role column type from text to "Role" enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
