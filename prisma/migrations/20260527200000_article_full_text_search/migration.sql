-- ============================================================
-- Full-text search for Article using a stored tsvector column
-- with weighted fields:
--   A (title)  → setweight 'A'  (highest)
--   B (tags, league, author) → setweight 'B'
--   C (excerpt) → setweight 'C'
--   D (body plain-text) → setweight 'D'  (lowest)
-- ============================================================

-- 1. Helper: recursively extract all text node "text" values from
--    TipTap/ProseMirror JSON stored in the content column.
--    Returns a space-joined plain text string.
--    Gracefully returns '' when content is not valid JSON.
CREATE OR REPLACE FUNCTION article_body_text(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parsed jsonb;
BEGIN
  BEGIN
    parsed := content::jsonb;
  EXCEPTION WHEN others THEN
    RETURN '';
  END;

  RETURN coalesce(
    (
      SELECT string_agg(v, ' ')
      FROM (
        SELECT jsonb_path_query(parsed, 'strict $.**.text')::text AS v
      ) sub
      WHERE v IS NOT NULL AND v <> 'null'
    ),
    ''
  );
END;
$$;

-- 2. Add the persisted tsvector column (nullable until backfill).
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 3. Backfill the column for all existing articles.
UPDATE "Article"
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(league, '') || ' ' || coalesce(author, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'C') ||
  setweight(to_tsvector('english', article_body_text(content)), 'D');

-- 4. GIN index so searches are fast.
CREATE INDEX IF NOT EXISTS "Article_search_vector_idx"
  ON "Article" USING gin(search_vector);

-- 5. Trigger function: recompute search_vector on every insert / update.
CREATE OR REPLACE FUNCTION article_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  tag_names text := '';
BEGIN
  -- Collect all tags for this article (many-to-many via "_ArticleToTag")
  SELECT coalesce(string_agg(t.name, ' '), '')
  INTO tag_names
  FROM "_ArticleToTag" jt
  JOIN "Tag" t ON t.id = jt."B"
  WHERE jt."A" = NEW.id;

  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english',
      coalesce(NEW.league, '') || ' ' ||
      coalesce(NEW.author, '') || ' ' ||
      coalesce(tag_names, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'C') ||
    setweight(to_tsvector('english', article_body_text(NEW.content)), 'D');

  RETURN NEW;
END;
$$;

-- 6. Attach trigger (drop first so re-running migration is idempotent).
DROP TRIGGER IF EXISTS article_search_vector_trigger ON "Article";
CREATE TRIGGER article_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, excerpt, content, league, author
  ON "Article"
  FOR EACH ROW
  EXECUTE FUNCTION article_search_vector_update();
