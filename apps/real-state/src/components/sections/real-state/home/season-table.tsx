"use client";

import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { REGIONS, type Property } from "@/lib/data/properties";
import { formatPrice } from "@/lib/format";

/** The whole season as a plain index; hovering a row shows that house in the print on the left. */
export function SeasonTable({ houses }: { houses: Property[] }) {
  const [current, setCurrent] = useState(houses[0]!.slug);
  const shown = houses.find((h) => h.slug === current) ?? houses[0]!;

  return (
    <section className="page-x mt-[clamp(120px,20vh,240px)]" aria-labelledby="index-title">
      <h2 id="index-title" data-reveal className="t-head max-md:!text-[9.5vw]">
        <span className="md:pl-[3vw]">Twelve houses,</span>
        <br />
        Sintra to Begur
      </h2>

      <div className="grid-12 mt-24 items-end">
        {/* Print that follows the hovered row */}
        <div className="col-span-4 hidden md:block">
          <div className="photo relative aspect-[4/5] w-[22vw]">
            {houses.map((h) => (
              <Image
                key={h.slug}
                src={h.cover.src}
                alt={h.slug === shown.slug ? h.cover.alt : ""}
                fill
                sizes="22vw"
                className={`object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  h.slug === shown.slug ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                }`}
              />
            ))}
          </div>
          <p className="t-small mt-2.5 text-soft" aria-live="polite">
            {shown.name} by {shown.architect}, {shown.year}
          </p>
        </div>

        <p className="col-start-7 hidden self-start pt-1 t-small text-soft md:block">Season</p>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          {REGIONS.map((region, gi) => {
            const rows = houses.filter((h) => h.region === region);
            if (!rows.length) return null;
            return (
              <div key={region} className={gi === 0 ? "" : "mt-11"}>
                <ul>
                  {rows.map((h, i) => (
                    <li key={h.slug} data-reveal style={{ ["--i" as string]: i }}>
                      <Link
                        href={`/properties/${h.slug}` as Route}
                        onMouseEnter={() => setCurrent(h.slug)}
                        onFocus={() => setCurrent(h.slug)}
                        className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-[13px] t-body md:grid-cols-[30%_1fr_auto]"
                      >
                        <span className="text-soft max-md:col-span-2 max-md:row-start-2 max-md:t-small">{h.town}</span>
                        <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">{h.name}</span>
                        <span className="tnum flex items-center gap-1.5 justify-self-end">
                          {formatPrice(h.price)}
                          <ArrowUpRight
                            className="size-4 opacity-40 transition-[opacity,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                            strokeWidth={1.6}
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="photo relative col-span-12 ml-auto mt-14 aspect-[4/5] w-[60%] md:hidden">
          <Image src={shown.cover.src} alt={shown.cover.alt} fill sizes="60vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
