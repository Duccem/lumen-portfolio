import type { Route } from "next";
import Link from "next/link";

import { CREDITS } from "@/lib/data/credits";
import { PART_CATEGORIES } from "@/lib/data/parts";
import { WORKSHOP } from "@/lib/data/services";

const BLOCKS = [
  { ch: "B", h: 92, bg: "var(--accent)" },
  { ch: "A", h: 70, bg: "var(--field-1)" },
  { ch: "Y", h: 100, bg: "var(--mid)" },
  { ch: " ", h: 0, bg: "transparent" },
  { ch: "S", h: 64, bg: "var(--surface-3)" },
  { ch: "E", h: 86, bg: "var(--field-1)" },
  { ch: "V", h: 76, bg: "var(--accent)" },
  { ch: "E", h: 100, bg: "var(--mid)" },
  { ch: "N", h: 82, bg: "var(--field-1)" },
];

/**
 * The name closes the page as a construction: each letter knocked out of its own block,
 * the blocks raised to different heights like cars on the seven lifts.
 */
export function Footer() {
  const word1 = BLOCKS.slice(0, 3);
  const word2 = BLOCKS.slice(4);

  return (
    <footer className="page-x mt-[clamp(120px,14vw,200px)] pb-3" aria-labelledby="footer-mark">
      <h2 id="footer-mark" className="sr-only">
        Bay Seven
      </h2>

      {/* Desktop: one row of blocks */}
      <div className="hidden h-[34svh] min-h-[240px] items-end gap-1 md:flex" aria-hidden>
        {BLOCKS.map((b, i) =>
          b.ch === " " ? (
            <div key={i} className="w-[3vw]" />
          ) : (
            <Block key={i} {...b} i={i} />
          ),
        )}
      </div>
      {/* Phone: two rows, BAY over SEVEN */}
      <div className="grid gap-1 md:hidden" aria-hidden>
        <div className="flex h-[16svh] min-h-[110px] items-end gap-1 pr-[40%]">
          {word1.map((b, i) => (
            <Block key={i} {...b} i={i} />
          ))}
        </div>
        <div className="flex h-[16svh] min-h-[110px] items-end gap-1">
          {word2.map((b, i) => (
            <Block key={i} {...b} i={i + 3} />
          ))}
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 t-body md:grid-cols-12">
        <FooterCol title="Workshop" className="md:col-span-2">
          <FooterLink href={"/#prices" as Route}>Price list</FooterLink>
          <FooterLink href="/book">Book a revision</FooterLink>
          <FooterLink href="/track">Track my car</FooterLink>
          <FooterLink href={"/#questions" as Route}>Questions</FooterLink>
        </FooterCol>
        <FooterCol title="Parts counter" className="md:col-span-2">
          {PART_CATEGORIES.slice(0, 5).map((c) => (
            <FooterLink key={c.id} href={{ pathname: "/parts", query: { c: c.id } }}>
              {c.name}
            </FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Hours" className="md:col-span-2">
          {WORKSHOP.hours.map((h) => (
            <li key={h.days}>
              <span className="text-soft">{h.days}</span>
              <br />
              <span className="tnum">{h.time}</span>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Find us" className="md:col-span-2">
          <li>
            {WORKSHOP.street}
            <br />
            {WORKSHOP.area}
          </li>
          <li>
            <a className="link tnum" href={WORKSHOP.phoneHref}>
              {WORKSHOP.phone}
            </a>
          </li>
          <li>
            <a className="link break-all" href={`mailto:${WORKSHOP.email}`}>
              {WORKSHOP.email}
            </a>
          </li>
        </FooterCol>
        <div className="col-span-2 md:col-span-4">
          <details className="group rounded-tile bg-surface [&:not([open])>div]:hidden">
            <summary className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors duration-200 hover:bg-surface-2">
              <span className="font-medium">Picture credits</span>
              <span className="plus" aria-hidden />
            </summary>
            <div className="px-5 pb-5">
              <p className="mb-3 text-soft">
                Photographs and footage of the trade from open collections. They show other workshops, not ours.
              </p>
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-2">
                {CREDITS.map((c) => (
                  <li key={c.file}>
                    <a href={c.page} target="_blank" rel="noreferrer" className="link">
                      {c.title}
                    </a>
                    <span className="text-soft">
                      {" "}
                      by {c.creator}, {c.licence}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>

      <div className="mt-14 flex items-center justify-between gap-4 t-small">
        <p className="text-soft">© {new Date().getFullYear()} Bay Seven. A sample site: names, prices and tickets are placeholders.</p>
        <a href="#top" className="btn btn-quiet !min-h-10 !px-4">
          Back to top
        </a>
      </div>
    </footer>
  );
}

function Block({ ch, h, bg, i }: { ch: string; h: number; bg: string; i: number }) {
  return (
    <div
      data-reveal
      className="relative flex flex-1 items-end justify-center overflow-hidden rounded-tile [container-type:inline-size]"
      style={{ height: `${h}%`, background: bg, ["--i" as string]: i }}
    >
      <span className="translate-y-[12%] font-[family-name:var(--ff-head)] text-[118cqw] font-light leading-[0.8] text-bg">
        {ch}
      </span>
    </div>
  );
}

function FooterCol({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3 className="mb-3 font-medium">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: React.ComponentProps<typeof Link>["href"]; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link">
        {children}
      </Link>
    </li>
  );
}
