/*
  Warnings:

  - You are about to drop the column `affiliation` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "affiliation";

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "serverId" TEXT,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AffiliationToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AffiliationToUser_AB_unique" ON "_AffiliationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AffiliationToUser_B_index" ON "_AffiliationToUser"("B");

-- AddForeignKey
ALTER TABLE "_AffiliationToUser" ADD CONSTRAINT "_AffiliationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Affiliation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AffiliationToUser" ADD CONSTRAINT "_AffiliationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
