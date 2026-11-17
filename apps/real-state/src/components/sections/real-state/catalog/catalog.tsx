"use client";

import { Check, LayoutGrid, Rows3, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PROPERTIES, REGIONS, TYPES, type Operation, type PropertyType, type Region } from "@/lib/data/properties";

import { useSaved } from "../saved/saved-context";
import { PriceRange } from "./price-range";
import { PropertyCard } from "./property-card";

type Sort = "newest" | "price-asc" | "price-desc" | "area";
const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "area", label: "Largest first" },
];
const DOMAIN: Record<Operation, { range: [number, number]; step: number }> = {
  buy: { range: [800_000, 4_800_000], step: 50_000 },
  rent: { range: [5_000, 11_000], step: 250 },
};
const BEDS = [0, 2, 3, 4, 5];

export function Catalog() {
  const params = useSearchParams();
  const { saved } = useSaved();

  const [op, setOp] = useState<Operation>(params.get("op") === "rent" ? "rent" : "buy");
  const [types, setTypes] = useState<PropertyType[]>(() => {
    const t = params.get("type") as PropertyType | null;
    return t && TYPES.some((x) => x.value === t) ? [t] : [];
  });
  const [regions, setRegions] = useState<Region[]>(() => {
    const r = params.get("region") as Region | null;
    return r && REGIONS.includes(r) ? [r] : [];
  });
  const [price, setPrice] = useState<[number, number]>(() => {
    const [lo, hi] = DOMAIN[op].range;
    const max = Number(params.get("max"));
    return max > lo && max < hi ? [lo, max] : [lo, hi];
  });
  const [beds, setBeds] = useState(0);
  const [savedOnly, setSavedOnly] = useState(params.get("saved") === "1");
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sheet, setSheet] = useState(false);

  // Keep the address shareable without re-rendering the route.
  useEffect(() => {
    const q = new URLSearchParams();
    if (op === "rent") q.set("op", "rent");
    if (types.length === 1) q.set("type", types[0]!);
    if (savedOnly) q.set("saved", "1");
    const s = q.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }, [op, types, savedOnly]);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  const pool = useMemo(() => PROPERTIES.filter((p) => p.operation === op), [op]);

  const results = useMemo(() => {
    const list = pool.filter(
      (p) =>
        (!types.length || types.includes(p.type)) &&
        (!regions.length || regions.includes(p.region)) &&
        p.price >= price[0] &&
        p.price <= price[1] &&
        p.beds >= beds &&
        (!savedOnly || saved.includes(p.slug)),
    );
    const by: Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      newest: (a, b) => b.listedOn.localeCompare(a.listedOn),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      area: (a, b) => b.area - a.area,
    };
    return [...list].sort(by[sort]);
  }, [pool, types, regions, price, beds, savedOnly, saved, sort]);

  const activeCount = types.length + regions.length + (beds ? 1 : 0) + (savedOnly ? 1 : 0) + (price[0] !== DOMAIN[op].range[0] || price[1] !== DOMAIN[op].range[1] ? 1 : 0);
  // Re-key the result list so cards replay their entrance when the selection changes.
  const resultKey = results.map((r) => r.slug).join("|") + view;

  const switchOp = (next: Operation) => {
    setOp(next);
    setPrice(DOMAIN[next].range);
  };
  const clear = () => {
    setTypes([]);
    setRegions([]);
    setBeds(0);
    setSavedOnly(false);
    setPrice(DOMAIN[op].range);
  };
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const filters = (
    <div className="space-y-10">
      {/* Buy / rent with a sliding indicator */}
      <div className="relative grid grid-cols-2 bg-surface p-1" role="radiogroup" aria-label="Buy or rent">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-ink transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: op === "rent" ? "translateX(100%)" : "none" }}
        />
        {(["buy", "rent"] as const).map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={op === o}
            onClick={() => switchOp(o)}
            className={`relative z-10 h-10 t-body transition-colors duration-300 ${op === o ? "text-bg" : "text-ink"}`}
          >
            {o === "buy" ? "Buy" : "Rent"}
          </button>
        ))}
      </div>

      <fieldset>
        <legend className="t-body mb-4 font-medium">Kind of house</legend>
        <div className="space-y-1">
          {TYPES.map((t) => (
            <CheckRow key={t.value} label={t.label} count={pool.filter((p) => p.type === t.value).length} checked={types.includes(t.value)} onChange={() => setTypes((x) => toggleIn(x, t.value))} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-body mb-4 font-medium">Region</legend>
        <div className="space-y-1">
          {REGIONS.map((r) => (
            <CheckRow key={r} label={r} count={pool.filter((p) => p.region === r).length} checked={regions.includes(r)} onChange={() => setRegions((x) => toggleIn(x, r))} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-body mb-1 font-medium">{op === "rent" ? "Monthly rent" : "Price"}</legend>
        <p className="t-small mb-4 text-soft">Each bar is a house; taller bars are larger homes.</p>
        <PriceRange houses={pool} domain={DOMAIN[op].range} step={DOMAIN[op].step} value={price} onChange={setPrice} rent={op === "rent"} />
      </fieldset>

      <fieldset>
        <legend className="t-body mb-4 font-medium">Bedrooms</legend>
        <div className="grid grid-cols-5 gap-1">
          {BEDS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={beds === b}
              onClick={() => setBeds(b)}
              className={`h-10 t-body transition-[background-color,color,transform] duration-200 active:scale-95 ${beds === b ? "bg-ink text-bg" : "bg-surface hover:bg-surface-2"}`}
            >
              {b === 0 ? "Any" : `${b}+`}
            </button>
          ))}
        </div>
      </fieldset>

      <CheckRow label="Saved homes only" count={saved.length} checked={savedOnly} onChange={() => setSavedOnly((v) => !v)} />
    </div>
  );

  return (
    <div className="page-x pb-[clamp(120px,18vh,200px)]">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10 pt-10 md:pt-16">
        <h1 className="lines t-display">
          <span className="line">
            <span data-line>{op === "rent" ? "To rent" : "This season"}</span>
          </span>
        </h1>
        <p data-rise className="t-body max-w-[52ch]">
          {op === "rent"
            ? "Two signed houses let by the year, furnished, with a minimum term of twelve months. Rent includes the gardener; utilities are paid by the tenant. Save the ones you like and we will show them on the same morning."
            : "Twelve architect-signed houses on the Iberian coast, each visited twice before listing. Every price is the asking price, and every plan comes from the architect. Save the ones you like and we will arrange the viewings in a single day."}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pb-6 pr-2 [scrollbar-width:thin]">{filters}</div>
        </aside>

        <section aria-label="Results">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="t-body" aria-live="polite">
              <span key={results.length} className="tnum enter t-lead inline-block">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "house" : "houses"}
              {activeCount > 0 && (
                <button type="button" onClick={clear} className="link t-small ml-4 text-soft">
                  Clear filters
                </button>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSheet(true)} className="btn btn-quiet !min-h-10 lg:hidden">
                <SlidersHorizontal className="size-4" strokeWidth={1.6} /> Filters{activeCount ? ` (${activeCount})` : ""}
              </button>
              <label className="t-body flex items-center gap-2">
                <span className="text-soft max-sm:sr-only">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 cursor-pointer bg-surface px-3 text-ink transition-colors hover:bg-surface-2">
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden bg-surface p-1 sm:flex" role="group" aria-label="Layout">
                {(
                  [
                    ["grid", LayoutGrid, "Grid"],
                    ["list", Rows3, "List"],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    aria-label={label}
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`grid size-8 place-items-center transition-colors duration-200 ${view === v ? "bg-ink text-bg" : "hover:bg-surface-2"}`}
                  >
                    <Icon className="size-4" strokeWidth={1.6} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="enter bg-surface px-8 py-16">
              <p className="t-lead max-w-[30ch]">No house in the season matches all of that.</p>
              <p className="mt-3 max-w-[48ch] text-soft">
                {savedOnly && saved.length === 0 ? "You have not saved a house yet. Tap the heart on any house to keep it here." : "Widen the price, or clear the filters and start from the whole season."}
              </p>
              <button type="button" onClick={clear} className="btn mt-8">
                Show every house
              </button>
            </div>
          ) : view === "grid" ? (
            <div key={resultKey} className="grid gap-x-[var(--gap)] gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <PropertyCard key={p.slug} property={p} index={i} />
              ))}
            </div>
          ) : (
            <div key={resultKey} className="space-y-2">
              {results.map((p, i) => (
                <PropertyCard key={p.slug} property={p} index={i} layout="list" />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Phone filter sheet */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sheet ? "visible" : "invisible"}`} role="dialog" aria-modal="true" aria-label="Filters">
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setSheet(false)}
          className={`absolute inset-0 bg-[#1b2105]/40 transition-opacity duration-300 ${sheet ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto bg-bg px-5 pb-28 pt-5 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            sheet ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <p className="t-lead">Filters</p>
            <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="grid size-11 place-items-center">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          {filters}
          <div className="fixed inset-x-0 bottom-0 bg-bg p-4">
            <button type="button" onClick={() => setSheet(false)} className="btn w-full">
              Show {results.length} {results.length === 1 ? "house" : "houses"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid size-[18px] place-items-center transition-[background-color,transform] duration-200 group-active:scale-90 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
          checked ? "bg-ink text-bg" : "bg-surface-2 group-hover:bg-[#c9c7bf]"
        }`}
      >
        <Check className={`size-3 transition-[opacity,transform] duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} strokeWidth={2.5} />
      </span>
      <span className="flex-1">{label}</span>
      <span className="t-small tnum text-soft">{count}</span>
    </label>
  );
}
