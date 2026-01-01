/*
  Warnings:

  - You are about to drop the column `authorId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- DropIndex
DROP INDEX "Article_featured_idx";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "authorId",
ADD COLUMN     "author" TEXT,
ADD COLUMN     "league" "League";

-- CreateTable
CREATE TABLE "LeagueConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "leagueConfigId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeagueConfig_code_key" ON "LeagueConfig"("code");

-- CreateIndex
CREATE INDEX "Conference_leagueConfigId_idx" ON "Conference"("leagueConfigId");

-- CreateIndex
CREATE INDEX "Article_league_idx" ON "Article"("league");

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_leagueConfigId_fkey" FOREIGN KEY ("leagueConfigId") REFERENCES "LeagueConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
