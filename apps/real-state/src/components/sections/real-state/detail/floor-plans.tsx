"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

import type { FloorPlan } from "@/lib/data/properties";
import { formatNumber } from "@/lib/format";

/** Plans drawn from the room data; the walls draw themselves in when the row enters. */
export function FloorPlans({ plans }: { plans: FloorPlan[] }) {
  const row = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => row.current?.scrollBy({ left: d * row.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-6">
        <h2 className="t-head">House plan</h2>
        {plans.length > 1 && (
          <div className="hidden gap-1 sm:flex">
            <button type="button" aria-label="Previous floor" onClick={() => scroll(-1)} className="grid size-10 place-items-center transition-[background-color,transform] hover:bg-surface active:scale-90">
              <ArrowLeft className="size-5" strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Next floor" onClick={() => scroll(1)} className="grid size-10 place-items-center transition-[background-color,transform] hover:bg-surface active:scale-90">
              <ArrowRight className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
      <div ref={row} className="flex flex-col gap-3 sm:-mr-[var(--margin)] sm:snap-x sm:snap-mandatory sm:flex-row sm:overflow-x-auto sm:pb-3 sm:pr-[var(--margin)] sm:[scrollbar-width:none]">
        {plans.map((plan, i) => (
          <figure key={plan.name} data-reveal className="plan w-full shrink-0 snap-start bg-surface p-5 sm:w-[46%]" style={{ ["--i" as string]: i }}>
            <svg viewBox="-3 -3 106 66" className="w-full" role="img" aria-label={`${plan.name} plan: ${plan.rooms.map((r) => r.label).join(", ")}`}>
              {plan.rooms.map((r, k) => (
                <g key={k}>
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    pathLength={1}
                    className="plan-wall"
                    fill="var(--bg)"
                    stroke="var(--ink)"
                    strokeWidth={0.7}
                    style={{ ["--k" as string]: k }}
                  />
                  <text x={r.x + 2.2} y={r.y + 5} fontSize={2.9} fill="var(--muted)" fontFamily="inherit">
                    {r.label}
                  </text>
                </g>
              ))}
              <rect x={0} y={0} width={100} height={60} fill="none" stroke="var(--ink)" strokeWidth={1.6} pathLength={1} className="plan-wall" />
            </svg>
            <figcaption className="t-small mt-4 flex justify-between text-soft">
              <span className="text-ink">{plan.name}</span>
              <span className="tnum">{formatNumber(plan.area)} m²</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
