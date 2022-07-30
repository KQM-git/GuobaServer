/*
  Warnings:

  - Added the required column `GOODId` to the `CalculationQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalculationQueue" ADD COLUMN     "GOODId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CalculationQueue" ADD CONSTRAINT "CalculationQueue_GOODId_fkey" FOREIGN KEY ("GOODId") REFERENCES "GOOD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
