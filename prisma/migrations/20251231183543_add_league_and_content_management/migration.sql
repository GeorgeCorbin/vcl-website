/*
  Warnings:

  - A unique constraint covering the columns `[weekNumber,season,league]` on the table `PollWeek` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "League" AS ENUM ('MCLA', 'SMLL', 'NCLL', 'WCLL', 'OTHER');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('DISPLAY', 'LEADERBOARD', 'SIDEBAR', 'POPUP', 'INLINE');

-- DropIndex
DROP INDEX "PollWeek_weekNumber_season_key";

-- AlterTable
ALTER TABLE "PollWeek" ADD COLUMN     "league" "League" NOT NULL DEFAULT 'MCLA';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "league" "League" NOT NULL DEFAULT 'MCLA';

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "league" "League" NOT NULL DEFAULT 'MCLA';

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adType" "AdType" NOT NULL,
    "code" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "placement" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "PollWeek_league_idx" ON "PollWeek"("league");

-- CreateIndex
CREATE UNIQUE INDEX "PollWeek_weekNumber_season_league_key" ON "PollWeek"("weekNumber", "season", "league");

-- CreateIndex
CREATE INDEX "Team_league_idx" ON "Team"("league");

-- CreateIndex
CREATE INDEX "Transfer_league_idx" ON "Transfer"("league");
