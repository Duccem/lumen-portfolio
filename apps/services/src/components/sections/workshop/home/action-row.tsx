import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { WORKSHOP } from "@/lib/data/services";

/** The close is one row of the board, cropped from a longer one: photo, the action, flat colour. */
export function ActionRow() {
  return (
    <section className="mt-[clamp(120px,14vw,200px)] overflow-hidden" aria-labelledby="action-title">
      {/* Desktop: the flanking tiles run off both edges */}
      <div className="hidden h-[360px] grid-cols-12 gap-3 md:grid" style={{ marginInline: "-6vw" }}>
        <div data-reveal className="tile tile-photo col-span-2">
          <Image src="/images/oil-pan.jpg" alt="An oil drain pan set under a car" fill sizes="20vw" className="object-cover" />
        </div>
        <ActionTile className="col-span-8" />
        <div data-reveal className="col-span-2 rounded-tile bg-field" style={{ ["--i" as string]: 2 }} />
      </div>

      {/* Phone */}
      <div className="page-x md:hidden">
        <ActionTile className="min-h-[300px]" />
        <div className="mt-1.5 grid h-[120px] grid-cols-2 gap-1.5">
          <div className="tile tile-photo">
            <Image src="/images/oil-pan.jpg" alt="An oil drain pan set under a car" fill sizes="50vw" className="object-cover" />
          </div>
          <div className="rounded-tile bg-field" />
        </div>
      </div>
    </section>
  );
}

function ActionTile({ className = "" }: { className?: string }) {
  return (
    <div data-reveal className={`flex flex-col justify-center rounded-tile bg-crimson p-6 text-white md:p-10 ${className}`} style={{ ["--i" as string]: 1 }}>
      <h2 id="action-title" className="t-head">
        Book the next free lift
      </h2>
      <p className="mt-3 max-w-[46ch] t-body">
        Pick the job, the car and an hour. You leave with a tag number; we take it from there.
        <br />
        Or call the desk on{" "}
        <a href={WORKSHOP.phoneHref} className="link tnum font-medium">
          {WORKSHOP.phone}
        </a>
        .
      </p>
      <Link href="/book" className="btn btn-ink group mt-6 self-start max-md:w-full max-md:self-stretch">
        Book a revision
        <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
      </Link>
    </div>
  );
}
