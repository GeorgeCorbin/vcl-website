-- AlterTable: store article league as configurable league code (not fixed enum)
ALTER TABLE "Article" ALTER COLUMN "league" TYPE TEXT USING "league"::TEXT;
