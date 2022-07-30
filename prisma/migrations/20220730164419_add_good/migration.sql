/*
  Warnings:

  - Added the required column `GOODId` to the `ExperimentData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExperimentData" ADD COLUMN     "GOODId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ExperimentData" ADD CONSTRAINT "ExperimentData_GOODId_fkey" FOREIGN KEY ("GOODId") REFERENCES "GOOD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
