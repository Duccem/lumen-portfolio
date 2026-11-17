import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

const MENU: { label: string; href: Route | { pathname: Route; query: Record<string, string> } }[] = [
  { label: "The season", href: "/properties" },
  { label: "Houses", href: { pathname: "/properties", query: { type: "house" } } },
  { label: "Villas", href: { pathname: "/properties", query: { type: "villa" } } },
  { label: "Townhouses", href: { pathname: "/properties", query: { type: "townhouse" } } },
  { label: "To rent", href: { pathname: "/properties", query: { op: "rent" } } },
];

export function Footer() {
  return (
    <footer className="grid bg-field text-field-ink md:min-h-svh md:grid-cols-2">
      <div className="photo relative h-[50svh] md:h-auto">
        <Image
          src="/images/homes/slate-house.jpg"
          alt="Detail of a slate-clad house with timber slats, lit at night"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[60%_50%] scale-[1.25] origin-[60%_50%]"
        />
      </div>

      <div className="flex flex-col px-5 pb-6 pt-14 md:px-[6vw] md:pt-20">
        <span className="t-lead font-medium">Lintel</span>

        <ul className="group/menu mt-10 space-y-5 md:mt-14 md:space-y-7">
          {MENU.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="block t-head !leading-none max-md:!text-[8vw] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/menu:opacity-55 md:hover:!translate-x-3 md:hover:!opacity-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="t-body mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <address className="not-italic">
            Rua das Flores 48, 1200-195 Lisbon
            <br />
            <a className="link" href="tel:+351210040120">
              +351 210 040 120
            </a>
            <br />
            <a className="link" href="mailto:viewings@lintel.example">
              viewings@lintel.example
            </a>
          </address>
          <div>
            Viewings Tuesday to Saturday, 10:00 to 18:00.
            <br />
            <a className="link" href="https://instagram.com" rel="noreferrer">
              Instagram
            </a>
            {"  ·  "}
            <a className="link" href="https://www.linkedin.com" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <p className="t-small mt-auto pt-16 opacity-80">
          © 2026 Lintel Properties. Sample listings; photographs from Unsplash, shown for design purposes only. Sea footage: “Ocean surface waves 10” by Mostafameraji, CC0, via Wikimedia Commons.
        </p>
      </div>
    </footer>
  );
}
