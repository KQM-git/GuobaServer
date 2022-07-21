-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "ar" INTEGER,
    "arXP" INTEGER,
    "affiliation" TEXT,
    "uid" TEXT,
    "GOODId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authentication" (
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Authentication_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "GOOD" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedTime" TIMESTAMP(3),
    "verificationArtifacts" JSONB[],
    "enkaResponse" JSONB,
    "hasChars" BOOLEAN NOT NULL DEFAULT false,
    "hasWeapons" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,

    CONSTRAINT "GOOD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticDataline" (
    "id" SERIAL NOT NULL,
    "experimentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataLine" JSONB NOT NULL,

    CONSTRAINT "StaticDataline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentData" (
    "id" SERIAL NOT NULL,
    "experimentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataLine" JSONB NOT NULL,
    "computerId" INTEGER NOT NULL,
    "computeTime" INTEGER NOT NULL,

    CONSTRAINT "ExperimentData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Computer" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Computer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputerLogs" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverTime" TIMESTAMP(3) NOT NULL,
    "computerId" INTEGER NOT NULL,
    "log" TEXT NOT NULL,

    CONSTRAINT "ComputerLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_GOODId_key" ON "User"("GOODId");

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_token_key" ON "Authentication"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_token_key" ON "Computer"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_GOODId_fkey" FOREIGN KEY ("GOODId") REFERENCES "GOOD"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GOOD" ADD CONSTRAINT "GOOD_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticDataline" ADD CONSTRAINT "StaticDataline_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentData" ADD CONSTRAINT "ExperimentData_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentData" ADD CONSTRAINT "ExperimentData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentData" ADD CONSTRAINT "ExperimentData_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputerLogs" ADD CONSTRAINT "ComputerLogs_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
