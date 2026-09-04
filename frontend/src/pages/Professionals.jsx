import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { CITIES, SERVICES } from "../lib/types";
import { ProfessionalCard, ProCardSkeleton } from "../components/cards";
import { Button, EmptyState, Icon, Select } from "../components/ui";
import { cn } from "../utils/cn";

export default function Professionals() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const service = params.get("service") ?? "";
  const city = params.get("city") ?? "";
  const minRating = params.get("min_rating") ?? "";
  const sort = params.get("sort") ?? "rating";

  const [term, setTerm] = useState(q);
  const [list, setList] = useState(null);
  const [all, setAll] = useState([]);

  /* debounce free-text search into the URL */
  useEffect(() => {
    const t = setTimeout(() => {
      if (term !== q) {
        const next = new URLSearchParams(params);
        if (term.trim()) next.set("q", term.trim());
        else next.delete("q");
        setParams(next, { replace: true });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  useEffect(() => {
    setTerm(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let alive = true;
    setList(null);
    api
      .search({ q, service, city, min_rating: minRating || undefined, sort })
      .then((r) => alive && setList(r))
      .catch(() => alive && setList([]));
    return () => {
      alive = false;
    };
  }, [q, service, city, minRating, sort]);

  useEffect(() => {
    api.search({}).then(setAll).catch(() => setAll([]));
  }, []);

  const counts = useMemo(() => {
    const m = {};
    all.forEach((p) => (m[p.service] = (m[p.service] ?? 0) + 1));
    return m;
  }, [all]);

  function patch(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  }

  const activeFilters = Boolean(q || service || city || minRating);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-[11px] text-muted">GET /search</p>
          <h1 className="mt-1 text-3xl font-extrabold">
            {service ? service : "All professionals"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {list === null ? "Searching…" : `${list.length} verified professional${list.length === 1 ? "" : "s"}${city ? ` in ${city}` : ""}`}
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by name, skill or locality…"
            className="h-11 w-full rounded-lg border border-line bg-paper pl-10 pr-3.5 text-sm placeholder:text-muted/70 focus:border-ink focus:outline-none"
          />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[248px_1fr]">
        {/* -------- filters -------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted">Filters</h2>
              {activeFilters && (
                <button
                  onClick={() => {
                    setTerm("");
                    setParams(new URLSearchParams(), { replace: true });
                  }}
                  className="text-[12px] font-bold text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-5">
              <p className="text-[13px] font-bold">Service</p>
              <ul className="mt-2.5 space-y-1.5">
                {SERVICES.map((s) => (
                  <li key={s}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-[13.5px] font-medium text-soft transition-colors hover:text-ink">
                      <input
                        type="checkbox"
                        checked={service === s}
                        onChange={() => patch({ service: service === s ? null : s })}
                        className="h-4 w-4 rounded border-line accent-[#141414]"
                      />
                      <span className="flex-1">{s}</span>
                      <span className="font-mono text-[11px] text-muted">{counts[s] ?? 0}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-[13px] font-bold">City</p>
              <Select value={city} onChange={(e) => patch({ city: e.target.value || null })} className="mt-2.5 h-10">
                <option value="">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <p className="text-[13px] font-bold">Minimum rating</p>
              <div className="mt-2.5 flex gap-2">
                {[["", "Any"], ["4", "4.0+"], ["4.5", "4.5+"]].map(([v, l]) => (
                  <button
                    key={v || "any"}
                    onClick={() => patch({ min_rating: v || null })}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-[12.5px] font-bold transition-colors",
                      minRating === v ? "border-ink bg-ink text-paper" : "border-line text-soft hover:border-ink/40",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[13px] font-bold">Sort by</p>
              <Select value={sort} onChange={(e) => patch({ sort: e.target.value })} className="mt-2.5 h-10">
                <option value="rating">Highest rated</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="experience">Most experienced</option>
              </Select>
            </div>
          </div>
        </aside>

        {/* -------- results -------- */}
        <section>
          {list === null ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProCardSkeleton key={i} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon="search"
              title="No professionals match those filters"
              desc="Try widening the city, lowering the minimum rating, or clearing the search term."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setTerm("");
                    setParams(new URLSearchParams(), { replace: true });
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p, i) => (
                <div key={p.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                  <ProfessionalCard pro={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
