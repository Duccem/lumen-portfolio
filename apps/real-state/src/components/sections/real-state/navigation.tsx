"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSaved } from "./saved/saved-context";

export function Navigation() {
  const { saved } = useSaved();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const last = useRef(0);
  const prevCount = useRef(saved.length);

  // Hide while scrolling down, return on the way up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 140 && y > last.current);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (saved.length !== prevCount.current) setBump((n) => n + 1);
    prevCount.current = saved.length;
  }, [saved.length]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onCatalogue = pathname.startsWith("/properties");

  return (
    <>
      <header
        className={`page-x sticky top-0 z-40 bg-bg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center t-small" aria-label="Main">
          <div className="hidden items-center gap-7 md:flex">
            <Link href="/properties" className={`link ${onCatalogue ? "link-on" : ""}`}>
              Catalogue
            </Link>
            <Link href={{ pathname: "/properties", query: { op: "rent" } }} className="link">
              To rent
            </Link>
          </div>
          <button
            type="button"
            className="-ml-2 grid size-11 place-items-center md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <Link href="/" className="t-lead justify-self-center font-medium" aria-label="Lintel, home">
            Lintel
          </Link>

          <div className="flex items-center justify-end gap-6">
            <Link href={{ pathname: "/properties", query: { saved: "1" } }} className="link hidden items-center gap-1.5 md:inline-flex">
              Saved
              <span key={bump} className={`tnum inline-block min-w-[1ch] ${bump ? "heart-pop" : ""}`}>
                {saved.length}
              </span>
            </Link>
            <Link href={{ pathname: "/", hash: "viewing" }} className="btn !min-h-10 !px-4 md:!min-h-11 md:!px-5">
              Book a viewing
            </Link>
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
        <div className="page-x flex h-[72px] items-center justify-between">
          <span className="t-lead font-medium">Lintel</span>
          <button type="button" className="-mr-2 grid size-11 place-items-center" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <ul className="page-x mt-10 space-y-5">
          {[
            { label: "Home", href: "/" as const },
            { label: "Catalogue", href: "/properties" as const },
            { label: "To rent", href: { pathname: "/properties", query: { op: "rent" } } },
            { label: `Saved (${saved.length})`, href: { pathname: "/properties", query: { saved: "1" } } },
          ].map((item, i) => (
            <li
              key={item.label}
              className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              <Link href={item.href} className="block text-[9vw] leading-none tracking-[-0.03em]" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
