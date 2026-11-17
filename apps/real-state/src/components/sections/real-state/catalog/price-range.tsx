"use client";

import type { Property } from "@/lib/data/properties";
import { formatShort } from "@/lib/format";

type Props = {
  houses: Property[];
  domain: [number, number];
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  rent?: boolean;
};

/**
 * Each bar is one house: its position is the price, its height the floor area.
 * Bars outside the chosen range fall back as you drag.
 */
export function PriceRange({ houses, domain, step, value, onChange, rent }: Props) {
  const [lo, hi] = domain;
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const maxArea = Math.max(...houses.map((h) => h.area), 1);
  const fmt = (v: number) => (rent ? `€${(v / 1000).toFixed(1)}k` : formatShort(v));

  return (
    <div>
      <div className="relative h-20" aria-hidden>
        {houses.map((h) => {
          const inside = h.price >= value[0] && h.price <= value[1];
          return (
            <span
              key={h.slug}
              title={`${h.name}, ${fmt(h.price)}`}
              className={`absolute bottom-0 w-[6px] -translate-x-1/2 origin-bottom transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                inside ? "scale-y-100 bg-ink" : "scale-y-[0.55] bg-surface-2"
              }`}
              style={{ left: `${pct(h.price)}%`, height: `${28 + (h.area / maxArea) * 72}%` }}
            />
          );
        })}
      </div>

      <div className="range-dual relative mt-1 h-6">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-surface-2" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ink"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={lo}
          max={hi}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - step), value[1]])}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={lo}
          max={hi}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + step)])}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-surface px-3 py-2">
          <span className="t-small block text-soft">Minimum</span>
          <span className="tnum">{fmt(value[0])}</span>
        </div>
        <div className="bg-surface px-3 py-2">
          <span className="t-small block text-soft">Maximum</span>
          <span className="tnum">{fmt(value[1])}</span>
        </div>
      </div>
    </div>
  );
}
