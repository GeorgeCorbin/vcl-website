-- Add new league enum values first so existing deployments can transition safely
ALTER TYPE "League" ADD VALUE IF NOT EXISTS 'WCLA';
ALTER TYPE "League" ADD VALUE IF NOT EXISTS 'WCLO';

-- Map legacy WCLL rows to WCLA before removing WCLL from the enum
UPDATE "PollWeek" SET "league" = 'WCLA' WHERE "league" = 'WCLL';
UPDATE "Transfer" SET "league" = 'WCLA' WHERE "league" = 'WCLL';
UPDATE "Team" SET "league" = 'WCLA' WHERE "league" = 'WCLL';

-- Recreate enum without WCLL
CREATE TYPE "League_new" AS ENUM ('MCLA', 'SMLL', 'NCLL', 'WCLA', 'WCLO', 'OTHER');

ALTER TABLE "PollWeek" ALTER COLUMN "league" DROP DEFAULT;
ALTER TABLE "Transfer" ALTER COLUMN "league" DROP DEFAULT;
ALTER TABLE "Team" ALTER COLUMN "league" DROP DEFAULT;

ALTER TABLE "PollWeek"
  ALTER COLUMN "league" TYPE "League_new"
  USING ("league"::text::"League_new");
ALTER TABLE "Transfer"
  ALTER COLUMN "league" TYPE "League_new"
  USING ("league"::text::"League_new");
ALTER TABLE "Team"
  ALTER COLUMN "league" TYPE "League_new"
  USING ("league"::text::"League_new");

DROP TYPE "League";
ALTER TYPE "League_new" RENAME TO "League";

ALTER TABLE "PollWeek" ALTER COLUMN "league" SET DEFAULT 'MCLA';
ALTER TABLE "Transfer" ALTER COLUMN "league" SET DEFAULT 'MCLA';
ALTER TABLE "Team" ALTER COLUMN "league" SET DEFAULT 'MCLA';
