-- AlterTable
-- Convert amount from TEXT to INTEGER
-- This assumes all TEXT values are valid integers
ALTER TABLE "Task" ALTER COLUMN "amount" TYPE INTEGER USING ("amount"::INTEGER);

