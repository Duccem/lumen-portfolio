import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { Property } from "@/lib/data/properties";
import { formatNumber, formatPrice } from "@/lib/format";

import { SaveButton } from "../saved/save-button";

type Props = { property: Property; index?: number; layout?: "grid" | "list"; sizes?: string };

export function PropertyCard({ property: p, index = 0, layout = "grid", sizes = "(min-width:1280px) 30vw, (min-width:768px) 45vw, 100vw" }: Props) {
  const href = `/properties/${p.slug}` as Route;
  const price = p.operation === "rent" ? `${formatPrice(p.price)} / month` : formatPrice(p.price);
  const specs = `${p.beds} beds · ${p.baths} baths · ${formatNumber(p.area)} m²`;

  if (layout === "list") {
    return (
      <article className="enter group relative grid grid-cols-[120px_1fr] gap-5 bg-surface/0 py-3 transition-colors duration-200 hover:bg-surface sm:grid-cols-[200px_1fr_auto] sm:items-center sm:pr-5" style={{ ["--i" as string]: index }}>
        <Link href={href} className="photo zoom relative block aspect-[4/3]">
          <Image src={p.cover.src} alt={p.cover.alt} fill sizes="200px" className="object-cover" />
        </Link>
        <div className="min-w-0">
          <h3 className="t-body">
            <Link href={href} className="after:absolute after:inset-0">
              {p.name}
            </Link>
          </h3>
          <p className="t-small text-soft">
            {p.town} · by {p.architect}, {p.year}
          </p>
          <p className="t-body mt-1">{specs}</p>
          <p className="tnum t-body mt-1 sm:hidden">{price}</p>
        </div>
        <div className="relative z-10 hidden items-center gap-4 sm:flex">
          <p className="tnum t-lead">{price}</p>
          <SaveButton slug={p.slug} name={p.name} />
        </div>
      </article>
    );
  }

  return (
    <article className="enter group relative" style={{ ["--i" as string]: index }}>
      <div className="relative">
        <Link href={href} className="photo zoom relative block aspect-[4/3]" tabIndex={-1} aria-hidden>
          <Image src={p.cover.src} alt="" fill sizes={sizes} className="object-cover" />
        </Link>
        <SaveButton slug={p.slug} name={p.name} className="absolute right-3 top-3" />
      </div>
      <p className="tnum t-lead mt-4">{price}</p>
      <p className="t-body mt-1">{specs}</p>
      <h3 className="t-body mt-3">
        <Link href={href} className="link">
          {p.name}, {p.town}
        </Link>
      </h3>
      <p className="t-body text-soft">
        by {p.architect}, {p.year}
      </p>
    </article>
  );
}
