"use client";

import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cartDetail, cartStore } from "@/lib/cart";

const LINKS: { href: Route; label: string; match: string }[] = [
  { href: "/#prices" as Route, label: "Prices", match: "#prices" },
  { href: "/parts", label: "Parts counter", match: "/parts" },
  { href: "/track", label: "Track my car", match: "/track" },
];

/**
 * A plain bar: wordmark, three links, one action. On the home page it stays out of the way
 * until the board of photographs has scrolled past, since the hero panel carries the same links.
 */
export function Navigation({ hideAtTop = false }: { hideAtTop?: boolean }) {
  const pathname = usePathname();
  const lines = cartStore.useValue();
  const { count } = cartDetail(lines);
  const [shown, setShown] = useState(!hideAtTop);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const prev = useRef(count);

  useEffect(() => {
    if (!hideAtTop) return;
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideAtTop]);

  useEffect(() => {
    if (count !== prev.current) setBump((n) => n + 1);
    prev.current = count;
  }, [count]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`page-x z-40 bg-bg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hideAtTop ? "fixed inset-x-0 top-0" : "sticky top-0"
        } ${shown || open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <nav className="flex h-16 items-center justify-between gap-6 t-small" aria-label="Main">
          <Link href="/" className="t-lead font-medium" aria-label="Bay Seven, home">
            Bay Seven
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link key={l.label} href={l.href} className={`link ${pathname === l.match ? "link-on" : ""}`}>
                {l.label}
                {l.match === "/parts" && count > 0 ? (
                  <span key={bump} className={`tnum ml-1.5 inline-block text-crimson ${bump ? "bump" : ""}`}>
                    {count}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/book" className="btn !min-h-11 !px-5">
              Book a revision
            </Link>
            <button
              type="button"
              className="-mr-2 grid size-11 place-items-center md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" strokeWidth={1.6} />
            </button>
          </div>
        </nav>
      </header>

      {/* Phone menu */}
      <div
        className={`fixed inset-0 z-50 bg-field text-field-ink transition-[opacity,visibility] duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="page-x flex h-16 items-center justify-between">
          <span className="t-lead font-medium">Bay Seven</span>
          <button type="button" className="-mr-2 grid size-11 place-items-center" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X className="size-5" strokeWidth={1.6} />
          </button>
        </div>
        <ul className="page-x mt-8 space-y-2">
          {[{ href: "/" as Route, label: "Home" }, ...LINKS, { href: "/book" as Route, label: "Book a revision" }].map((item, i) => (
            <li
              key={item.label}
              className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              <Link
                href={item.href}
                className="block rounded-tile bg-[#e2e2e2] px-5 py-4 font-[family-name:var(--ff-head)] text-[8vw] font-light leading-none tracking-[-0.022em]"
                onClick={() => setOpen(false)}
              >
                {item.label}
                {item.label === "Parts counter" && count > 0 ? <span className="tnum text-crimson"> {count}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
