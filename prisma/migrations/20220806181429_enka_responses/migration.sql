/*
  Warnings:

  - You are about to drop the column `enkaResponses` on the `GOOD` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GOOD" DROP COLUMN "enkaResponses";

-- CreateTable
CREATE TABLE "EnkaResponse" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "GOODId" INTEGER NOT NULL,

    CONSTRAINT "EnkaResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnkaResponse" ADD CONSTRAINT "EnkaResponse_GOODId_fkey" FOREIGN KEY ("GOODId") REFERENCES "GOOD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
