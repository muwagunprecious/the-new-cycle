-- SQL Script to update database schema for Buyer Verification System
-- Run this in the Supabase SQL Editor

-- 1. Add verification status and document fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accountStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ninDocument" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cacDocument" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- 2. Add bank detail fields to users table (if they don't exist)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accountName" TEXT;

-- 3. (Optional) Check current status
SELECT role, "accountStatus" FROM users LIMIT 10;
