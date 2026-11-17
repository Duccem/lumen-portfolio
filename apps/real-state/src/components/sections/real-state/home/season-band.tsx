"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Property } from "@/lib/data/properties";
import { formatPrice } from "@/lib/format";

const GROW = [5, 2, 3, 2];

/** Four of the season's houses as one folded view. Hovering a panel opens it. */
export function SeasonBand({ houses }: { houses: Property[] }) {
  const [active, setActive] = useState<number | null>(null);
  const four = houses.slice(0, 4);

  return (
    <section className="pt-[clamp(120px,16vh,200px)]" aria-labelledby="season-title">
      <div className="page-x grid-12">
        <h2 id="season-title" data-reveal className="t-head col-span-12 col-start-1 mb-16 md:col-span-8 md:col-start-3">
          The autumn season
        </h2>
      </div>

      {/* Desktop band */}
      <div className="hidden h-[68svh] min-h-[460px] md:flex" onMouseLeave={() => setActive(null)}>
        {four.map((p, i) => (
          <Link
            key={p.slug}
            href={`/properties/${p.slug}` as Route}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="photo group relative block min-w-0 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ flexGrow: active === i ? 6 : GROW[i], flexBasis: 0 }}
          >
            <Image src={p.cover.src} alt={p.cover.alt} fill sizes="50vw" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-6 top-6 bg-[#1b2105]/55 px-3 py-2 t-lead text-bg">
                {p.name},
                <br />
                {p.town}
              </span>
            )}
            <span
              className={`absolute bottom-0 left-0 bg-bg px-4 py-3 t-small transition-[opacity,transform] duration-300 ${
                active === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {i === 0 ? "" : `${p.name}, ${p.town} · `}
              <span className="tnum">{formatPrice(p.price)}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Phone block: two rows of unequal slices */}
      <div className="grid h-[84svh] grid-rows-2 md:hidden">
        {[0, 2].map((row) => (
          <div key={row} className={`grid ${row === 0 ? "grid-cols-[64fr_36fr]" : "grid-cols-[36fr_64fr]"}`}>
            {four.slice(row, row + 2).map((p, j) => (
              <Link key={p.slug} href={`/properties/${p.slug}` as Route} className="photo relative block">
                <Image src={p.cover.src} alt={p.cover.alt} fill sizes="64vw" className="object-cover" />
                {row === 0 && j === 0 && (
                  <span className="absolute left-4 top-4 bg-[#1b2105]/55 px-2.5 py-1.5 t-lead text-bg">
                    {p.name},
                    <br />
                    {p.town}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <p data-reveal className="page-x mt-5 max-w-[56ch]">
        {four.map((p) => `${p.name} by ${p.architect}`).join(", ")}: four of the twelve. Open one to walk through it.
      </p>
    </section>
  );
}
