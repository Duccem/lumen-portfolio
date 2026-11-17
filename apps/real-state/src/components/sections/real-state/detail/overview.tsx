"use client";

import { Mountain, Sun, Trees, Waves, Fence, Flag } from "lucide-react";
import { useState } from "react";

import type { Property } from "@/lib/data/properties";
import { formatNumber } from "@/lib/format";

const VIEW_ICON: Record<string, typeof Waves> = {
  "Ocean view": Waves,
  "Sea view": Waves,
  Lagoon: Waves,
  "River mouth": Waves,
  Pool: Sun,
  "Forest view": Trees,
  "Cork forest": Trees,
  Garden: Trees,
  "Rice fields": Trees,
  "Mountain view": Mountain,
  Courtyard: Fence,
  Golf: Flag,
};

export function Overview({ property: p }: { property: Property }) {
  const [specs, setSpecs] = useState(false);
  const [more, setMore] = useState(false);

  const facts = [
    { n: formatNumber(p.area), unit: "m²" },
    { n: p.floors, unit: p.floors === 1 ? "floor" : "floors" },
    { n: p.beds, unit: "beds" },
    { n: p.baths, unit: "baths" },
  ];
  const table = [
    ["Architect", p.architect],
    ["Completed", String(p.year)],
    ["Kind", p.type[0]!.toUpperCase() + p.type.slice(1)],
    ["Built area", `${formatNumber(p.area)} m²`],
    ["Plot", `${formatNumber(p.plot)} m²`],
    ["Floors", String(p.floors)],
    ["Bedrooms", String(p.beds)],
    ["Bathrooms", String(p.baths)],
    ["Energy rating", p.year >= 2020 ? "A+" : "A"],
    ["Address", `${p.street}, ${p.town}`],
  ];

  return (
    <div>
      <dl className="flex flex-wrap gap-x-8 gap-y-3">
        {facts.map((f, i) => (
          <div key={f.unit} data-reveal className="flex items-baseline gap-1.5" style={{ ["--i" as string]: i }}>
            <dt className="sr-only">{f.unit}</dt>
            <dd className="tnum t-head !leading-none">{f.n}</dd>
            <dd className="t-body">{f.unit}</dd>
          </div>
        ))}
      </dl>

      <button type="button" onClick={() => setSpecs((v) => !v)} aria-expanded={specs} className={`link t-body mt-5 ${specs ? "" : "link-on"}`}>
        {specs ? "Hide technical specifications" : "All technical specifications"}
      </button>
      <div className="expand" data-open={specs}>
        <div>
          <table className="t-body mt-6 w-full max-w-xl">
            <tbody>
              {table.map(([k, v]) => (
                <tr key={k} className="odd:bg-surface">
                  <th scope="row" className="px-3 py-2.5 pr-6 text-left font-normal text-soft">
                    {k}
                  </th>
                  <td className="px-3 py-2.5 text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        {p.views.map((v) => {
          const Icon = VIEW_ICON[v] ?? Sun;
          return (
            <li key={v} className="flex items-center gap-2.5">
              <Icon className="size-5" strokeWidth={1.4} aria-hidden />
              {v}
            </li>
          );
        })}
      </ul>

      <div id="description" className="mt-10 max-w-[62ch] scroll-mt-28">
        <p className="t-lead">{p.summary}</p>
        <p className="mt-5">{p.story}</p>
        <div className="expand" data-open={more}>
          <div>
            <p className="mt-5">
              The house is sold with the architect&apos;s full set of drawings, the building licence and the habitation certificate. It is {p.type === "villa" ? "offered" : "sold"} furnished or
              empty, as the buyer prefers; the furniture in the photographs is listed separately.
            </p>
            <p className="mt-5">
              {p.agent.name} has visited it twice, once with the plans and once at dusk, and will open the door for every viewing. The
              nearest beach, {p.distances[0]?.label}, is {p.distances[0]?.value} away by car.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className={`link t-body mt-5 ${more ? "" : "link-on"}`}>
          {more ? "Show less" : "Read the full description"}
        </button>
      </div>
    </div>
  );
}
