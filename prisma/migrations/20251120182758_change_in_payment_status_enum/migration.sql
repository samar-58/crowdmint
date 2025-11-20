-- AlterEnum
ALTER TYPE "PayoutStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Payouts" ALTER COLUMN "signature" DROP NOT NULL;
