"use client";

import { useEffect, useState } from "react";

export type SectionLink = { id: string; label: string };

/** Follows the reader down the page; the current section carries the arrow. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <ul className="space-y-1.5 t-small">
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "location" : undefined}
                className={`group flex items-center gap-2 py-0.5 transition-colors duration-200 ${on ? "text-ink" : "text-soft hover:text-ink"}`}
              >
                <span
                  aria-hidden
                  className={`inline-block transition-[opacity,transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "w-4 translate-x-0 opacity-100" : "w-0 -translate-x-2 opacity-0"}`}
                >
                  →
                </span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
