-- Fix article_body_text to strip HTML (content is stored as HTML, not TipTap JSON)
-- and re-backfill all search_vector values.

CREATE OR REPLACE FUNCTION article_body_text(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parsed jsonb;
  json_text text;
BEGIN
  IF content IS NULL OR content = '' THEN
    RETURN '';
  END IF;

  -- Try TipTap JSON first
  BEGIN
    parsed := content::jsonb;
    IF jsonb_typeof(parsed) = 'object' THEN
      SELECT coalesce(string_agg(v, ' '), '')
      INTO json_text
      FROM (
        SELECT jsonb_path_query(parsed, 'strict $.**.text')::text AS v
      ) sub
      WHERE v IS NOT NULL AND v <> 'null' AND v <> '""' AND trim(both '"' from v) <> '';
      RETURN coalesce(json_text, '');
    END IF;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  -- Strip HTML tags (covers HTML content and plain text)
  RETURN regexp_replace(
    regexp_replace(content, '<[^>]+>', ' ', 'g'),
    '\s+', ' ', 'g'
  );
END;
$$;

-- Re-backfill all articles with corrected body text + tags included
UPDATE "Article" a
SET search_vector =
  setweight(to_tsvector('english', coalesce(a.title, '')), 'A') ||
  setweight(to_tsvector('english',
    coalesce(a.league, '') || ' ' ||
    coalesce(a.author, '') || ' ' ||
    coalesce((
      SELECT string_agg(t.name, ' ')
      FROM "_ArticleToTag" jt
      JOIN "Tag" t ON t.id = jt."B"
      WHERE jt."A" = a.id
    ), '')
  ), 'B') ||
  setweight(to_tsvector('english', coalesce(a.excerpt, '')), 'C') ||
  setweight(to_tsvector('english', article_body_text(a.content)), 'D');
