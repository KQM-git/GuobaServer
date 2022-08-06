/*
  Warnings:

  - You are about to drop the column `enkaResponse` on the `GOOD` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GOOD" DROP COLUMN "enkaResponse",
ADD COLUMN     "enkaResponses" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "verifiedArtifacts" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
