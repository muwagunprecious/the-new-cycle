-- SQL Script to add missing Store columns for seller verification

-- Add seller verification fields to Store table
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "nin" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "cac" TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Store' 
AND column_name IN ('nin', 'cac');
