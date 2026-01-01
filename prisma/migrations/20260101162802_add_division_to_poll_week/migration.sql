/*
  Warnings:

  - A unique constraint covering the columns `[weekNumber,season,league,division]` on the table `PollWeek` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PollWeek_weekNumber_season_league_key";

-- AlterTable
ALTER TABLE "PollWeek" ADD COLUMN     "division" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PollWeek_weekNumber_season_league_division_key" ON "PollWeek"("weekNumber", "season", "league", "division");
