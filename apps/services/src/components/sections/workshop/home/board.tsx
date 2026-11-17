import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TrackerForm } from "../tracker-form";

/**
 * Mosaic of unlike tiles: no two neighbours hold the same kind of thing.
 * Desktop rows are 96px; four tile sizes only (6×5, 6×3, 3×3, 3×2).
 */
export function Board() {
  return (
    <section className="page-x mt-3" aria-labelledby="board-title">
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-12 lg:grid-rows-[repeat(10,96px)] lg:gap-2">
        {/* Heading, 6×3 */}
        <div data-reveal className="tile col-span-2 bg-surface lg:col-span-6 lg:row-span-3">
          <h2 id="board-title" className="t-head max-w-[12ch]">
            Your car, on our board
          </h2>
        </div>

        {/* Photograph, 6×5 */}
        <div data-reveal className="tile tile-photo drift col-span-2 max-lg:order-first aspect-[4/3] lg:col-span-6 lg:row-span-5 lg:aspect-auto" style={{ ["--i" as string]: 1 }}>
          <Image
            src="/images/grinding-bench.jpg"
            alt="A mechanic at a bench grinder in a car workshop"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* The live tile: the tracker, 6×5 */}
        <div data-reveal className="tile col-span-2 bg-field text-field-ink max-lg:order-1 lg:col-span-6 lg:row-span-5" style={{ ["--i" as string]: 2 }}>
          <h3 className="t-lead mb-5 font-medium">Where is my car?</h3>
          <TrackerForm />
        </div>

        {/* Figure, 3×3 */}
        <div data-reveal className="tile flex aspect-square flex-col bg-crimson text-white lg:col-span-3 lg:row-span-3 lg:aspect-auto" style={{ ["--i" as string]: 3 }}>
          <p className="t-display tnum leading-none">7</p>
          <p className="mt-auto t-body">lifts, so a booked car goes up the day it comes in.</p>
        </div>

        {/* Short list, 3×3 */}
        <div data-reveal className="tile flex aspect-square flex-col bg-surface-2 lg:col-span-3 lg:row-span-3 lg:aspect-auto" style={{ ["--i" as string]: 4 }}>
          <ul className="space-y-1.5 t-body lg:space-y-2">
            <li>Revisions from $45</li>
            <li>Brakes the same day</li>
            <li>Tyres fitted and balanced</li>
            <li>Faults read and printed</li>
          </ul>
        </div>

        {/* Sentence, 3×2 */}
        <div data-reveal className="tile col-span-2 min-h-[150px] bg-surface max-lg:order-2 lg:col-span-3 lg:row-span-2" style={{ ["--i" as string]: 5 }}>
          <p className="t-lead">No work starts until you approve the quote.</p>
        </div>

        {/* Sentence with a link, 3×2 */}
        <Link
          href="/parts"
          data-reveal
          className="tile press group col-span-2 max-lg:order-2 flex min-h-[150px] flex-col bg-surface lg:col-span-3 lg:row-span-2"
          style={{ ["--i" as string]: 6 }}
        >
          <p className="t-lead">Parts reserved online, waiting at the counter.</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 t-small text-soft transition-colors group-hover:text-ink">
            Open the parts counter
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden />
          </span>
        </Link>

        {/* Photograph, 3×2 */}
        <div data-reveal className="tile tile-photo zoom col-span-1 max-lg:order-2 aspect-square lg:col-span-3 lg:row-span-2 lg:aspect-auto" style={{ ["--i" as string]: 7 }}>
          <Image src="/images/oil-funnel.jpg" alt="Engine oil poured through a yellow funnel" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
        </div>

        {/* Sentence, 3×2 */}
        <div data-reveal className="tile col-span-1 max-lg:order-2 flex aspect-square flex-col bg-surface-2 lg:col-span-3 lg:row-span-2 lg:aspect-auto" style={{ ["--i" as string]: 8 }}>
          <p className="t-lead">Open Saturday mornings, until one.</p>
        </div>
      </div>
    </section>
  );
}
