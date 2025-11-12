/*
  Warnings:

  - You are about to drop the column `balanceIndex` on the `Worker` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "balanceIndex";

-- CreateTable
CREATE TABLE "Payouts" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL,

    CONSTRAINT "Payouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payouts" ADD CONSTRAINT "Payouts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
