-- CreateTable
CREATE TABLE "LeagueDivision" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "leagueConfigId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueDivision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "conferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueDivision_leagueConfigId_idx" ON "LeagueDivision"("leagueConfigId");

-- CreateIndex
CREATE INDEX "ConferenceRegion_conferenceId_idx" ON "ConferenceRegion"("conferenceId");

-- AddForeignKey
ALTER TABLE "LeagueDivision" ADD CONSTRAINT "LeagueDivision_leagueConfigId_fkey" FOREIGN KEY ("leagueConfigId") REFERENCES "LeagueConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceRegion" ADD CONSTRAINT "ConferenceRegion_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
