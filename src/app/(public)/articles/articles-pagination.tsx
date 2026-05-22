import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

export { PAGE_SIZE };

function buildPageHref(
  page: number,
  filters: { league?: string; tag?: string; q?: string }
) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters.league) params.set("league", filters.league);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return `/articles${qs ? `?${qs}` : ""}`;
}

interface ArticlesPaginationProps {
  currentPage: number;
  totalPages: number;
  league?: string;
  tag?: string;
  q?: string;
}

export function ArticlesPagination({
  currentPage,
  totalPages,
  league,
  tag,
  q,
}: ArticlesPaginationProps) {
  if (totalPages <= 1) return null;

  const filters = { league, tag, q };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const linkClass = (active: boolean) =>
    `flex items-center justify-center w-9 h-9 rounded-sm text-xs font-semibold transition-colors ${
      active
        ? "bg-vcl-gold text-vcl-gold-foreground font-bold"
        : "border border-border text-muted-foreground hover:text-foreground hover:border-vcl-gold/40"
    }`;

  const navClass = (disabled: boolean) =>
    `flex items-center justify-center w-9 h-9 rounded-sm border border-border text-xs transition-colors ${
      disabled
        ? "text-muted-foreground/40 pointer-events-none"
        : "text-muted-foreground hover:text-foreground hover:border-vcl-gold/40"
    }`;

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(currentPage - 1, filters)}
          className={navClass(false)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={navClass(true)} aria-hidden="true">
          <ChevronLeft className="h-3.5 w-3.5" />
        </span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildPageHref(page, filters)}
          className={linkClass(page === currentPage)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(currentPage + 1, filters)}
          className={navClass(false)}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={navClass(true)} aria-hidden="true">
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}
