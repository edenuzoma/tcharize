"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, LoaderCircle, ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface SearchHit {
  objectID: string;
  title: string;
  section: string;
  content: string;
  url: string;
}

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "BSA94HWH77";
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "c1806990ef08d68b239e9c6cbee32413";
  const indexName = "tcharize_docs";

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://${appId}-dsn.algolia.net/1/indexes/${indexName}/query`,
          {
            method: "POST",
            headers: {
              "x-algolia-application-id": appId,
              "x-algolia-api-key": searchKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              hitsPerPage: 6,
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as { hits?: SearchHit[] };
          startTransition(() => {
            setHits(data.hits || []);
          });
        }
      } catch (err) {
        console.error("Docs search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, appId, searchKey]);

  return (
    <div className="relative mb-10 w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-4 text-ink/40 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (!val.trim()) {
              setHits([]);
              setLoading(false);
            }
          }}
          placeholder="Search documentation, guides, and API endpoints..."
          className="w-full rounded-2xl border-2 border-ink/10 bg-mist py-3.5 pl-11 pr-10 text-sm font-medium outline-none transition focus:border-secondary focus:bg-surface focus:shadow-[4px_4px_0_#9eff1f]"
        />
        {loading && (
          <LoaderCircle
            size={16}
            className="absolute right-4 animate-spin text-secondary"
          />
        )}
      </div>

      {query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-2xl border-2 border-ink bg-surface p-3 shadow-[8px_8px_0_#9eff1f]">
          <div className="flex items-center justify-between border-b border-ink/10 pb-2 px-2 text-xs font-bold text-ink/50">
            <span>Search Results from Algolia</span>
            <span>{hits.length} found</span>
          </div>

          {hits.length === 0 && !loading && (
            <div className="p-6 text-center text-sm text-ink/60">
              No matching docs found for &ldquo;{query}&rdquo;. Try words like <code className="font-bold">translate</code>, <code className="font-bold">api</code>, or <code className="font-bold">paystack</code>.
            </div>
          )}

          <div className="mt-2 space-y-1">
            {hits.map((hit) => (
              <Link
                key={hit.objectID}
                href={hit.url}
                onClick={() => setQuery("")}
                className="group flex items-start gap-3 rounded-xl p-3 text-left transition hover:bg-mist"
              >
                <div className="mt-0.5 rounded-lg bg-secondary/10 p-1.5 text-secondary group-hover:bg-secondary group-hover:text-white">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-ink group-hover:text-secondary">
                      {hit.title}
                    </p>
                    <span className="shrink-0 rounded-full border border-ink/10 bg-mist px-2 py-0.5 text-[10px] font-bold text-ink/60">
                      {hit.section}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/65 leading-relaxed">
                    {hit.content}
                  </p>
                </div>
                <ArrowUpRight
                  size={15}
                  className="mt-1 text-ink/30 opacity-0 transition group-hover:opacity-100 group-hover:text-secondary"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
