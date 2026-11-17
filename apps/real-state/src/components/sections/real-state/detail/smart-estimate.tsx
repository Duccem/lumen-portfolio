import { Check } from "lucide-react";

import type { Property } from "@/lib/data/properties";
import { estimateFor } from "@/lib/data/properties";
import { formatPrice, formatShort } from "@/lib/format";

const W = 600;
const H = 220;
const PAD = { l: 8, r: 16, t: 16, b: 30 };

/** Eight years of comparable prices and where this asking price sits in our estimate. */
export function SmartEstimate({ property: p }: { property: Property }) {
  const est = estimateFor(p);
  const values = est.history.map((h) => h.value);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values, est.high) * 1.02;
  const x = (i: number) => PAD.l + (i / (est.history.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const d = est.history.map((h, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(h.value).toFixed(1)}`).join(" ");
  const last = est.history.at(-1)!;

  // Position of the asking price on a scale running 15% either side of the estimate.
  const scaleLo = est.low * 0.85;
  const scaleHi = est.high * 1.15;
  const at = (v: number) => ((v - scaleLo) / (scaleHi - scaleLo)) * 100;
  const rent = p.operation === "rent";
  const fmt = (v: number) => (rent ? `${formatPrice(v)}` : formatPrice(v));

  return (
    <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr]">
      <figure data-reveal className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Comparable prices near ${p.town}, ${est.history[0]!.year} to ${last.year}, rising to ${fmt(last.value)}.`}>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="var(--surface-2)" strokeWidth={1} />
          ))}
          <path d={d} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="chart-line" />
          <circle cx={x(est.history.length - 1)} cy={y(last.value)} r={5} fill="var(--ink)" className="chart-dot" />
          {est.history.map((h, i) => (
            <text key={h.year} x={x(i)} y={H - 8} fontSize={12} fill="var(--muted)" textAnchor={i === 0 ? "start" : i === est.history.length - 1 ? "end" : "middle"} fontFamily="inherit">
              {h.year}
            </text>
          ))}
        </svg>
        <figcaption className="t-small mt-2 text-soft">
          Asking prices of comparable signed houses near {p.town}, {est.history[0]!.year} to {last.year}.
        </figcaption>
      </figure>

      <div data-reveal style={{ ["--i" as string]: 1 }}>
        <div className="flex justify-between t-small text-soft">
          <span>Lower price</span>
          <span>Higher price</span>
        </div>
        <div className="relative mt-3 h-2 bg-surface-2">
          <div className="estimate-band absolute inset-y-0 bg-ink/35" style={{ left: `${at(est.low)}%`, right: `${100 - at(est.high)}%` }} />
          <div className="absolute -top-2.5 h-7 w-[3px] -translate-x-1/2 bg-ink" style={{ left: `${at(p.price)}%` }} aria-hidden />
        </div>
        <p className="tnum t-lead mt-5">
          {rent ? `${formatPrice(est.low)} to ${formatPrice(est.high)} a month` : `${formatShort(est.low)} to ${formatShort(est.high)}`}
        </p>
        <p className="t-small text-soft">Our estimate. The asking price is the dark mark.</p>

        <p className="t-body mt-8 font-medium">What lifts the price</p>
        <ul className="mt-3 space-y-2">
          {est.factors.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check className="mt-1 size-4 shrink-0" strokeWidth={2} />
              <span>{f[0]!.toUpperCase() + f.slice(1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
