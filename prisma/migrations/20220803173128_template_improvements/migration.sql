-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "x" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "y" TEXT NOT NULL DEFAULT 'Unknown';
