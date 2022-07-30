/*
  Warnings:

  - A unique constraint covering the columns `[experimentId,userId,GOODId]` on the table `CalculationQueue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CalculationQueue_experimentId_userId_GOODId_key" ON "CalculationQueue"("experimentId", "userId", "GOODId");
