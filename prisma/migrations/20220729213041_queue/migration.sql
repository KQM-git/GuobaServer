-- AlterTable
ALTER TABLE "Authentication" ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Computer" ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ExperimentData" ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StaticDataline" ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "CalculationQueue" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experimentId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "computerId" INTEGER NOT NULL,

    CONSTRAINT "CalculationQueue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalculationQueue" ADD CONSTRAINT "CalculationQueue_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationQueue" ADD CONSTRAINT "CalculationQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationQueue" ADD CONSTRAINT "CalculationQueue_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
