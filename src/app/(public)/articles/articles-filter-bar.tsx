"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface ArticlesFilterBarProps {
  activeLeague?: string;
  activeSearch?: string;
  leagues: { id: string; name: string; code: string }[];
}

export function ArticlesFilterBar({ activeLeague, activeSearch, leagues }: ArticlesFilterBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(activeSearch ?? "");

  useEffect(() => {
    setQuery(activeSearch ?? "");
  }, [activeSearch]);

  const buildHref = (league?: string, q?: string) => {
    const params = new URLSearchParams();
    if (league && league !== "All") params.set("league", league);
    if (q && q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return `/articles${qs ? `?${qs}` : ""}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref(activeLeague, query));
  };

  const filterLeagues = ["All", ...leagues.map((l) => l.code)];

  return (
    <div className="border-b border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filterLeagues.map((league) => {
            const isActive =
              (!activeLeague && league === "All") ||
              activeLeague?.toUpperCase() === league.toUpperCase();
            return (
              <Link
                key={league}
                href={buildHref(league, query)}
                className={`shrink-0 flex items-center justify-center h-8 px-3.5 text-xs font-semibold rounded-sm transition-colors ${
                  isActive
                    ? "bg-vcl-gold text-vcl-gold-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {league}
              </Link>
            );
          })}
        </div>
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 h-8 w-[220px] focus-within:border-vcl-gold/50 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          />
        </form>
      </div>
    </div>
  );
}
