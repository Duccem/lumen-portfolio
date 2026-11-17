import { PRICE_LIST } from "@/lib/data/services";
import { formatMoney } from "@/lib/format";

/**
 * The price board on the workshop wall: one word across the column, then filled bars
 * that open in place. Beside it, footage of the trade runs as a muted loop.
 */
export function PriceList() {
  return (
    <section id="prices" className="page-x mt-[clamp(120px,14vw,200px)] scroll-mt-20" aria-labelledby="prices-title">
      <div className="grid gap-2 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="[container-type:inline-size]">
            <h2
              id="prices-title"
              data-reveal
              className="font-[family-name:var(--ff-head)] text-[33cqw] font-light leading-[0.8] tracking-[-0.04em]"
            >
              Prices
            </h2>
          </div>
          <p data-reveal className="mt-6 max-w-[48ch] t-body" style={{ ["--i" as string]: 1 }}>
            Labour and standard parts included. A price marked “from” depends on the car; you see the exact figure on
            the quote before anything starts.
          </p>

          <div className="mt-6 space-y-1.5">
            {PRICE_LIST.map((g, gi) => (
              <details
                key={g.id}
                name="prices"
                open={gi === 0}
                data-reveal
                style={{ ["--i" as string]: gi + 2 }}
                className="group overflow-hidden rounded-tile bg-surface [&:not([open])>ul]:hidden"
              >
                <summary className="flex min-h-14 items-center justify-between gap-4 px-[18px] transition-colors duration-200 hover:bg-surface-2">
                  <span className="t-body font-medium">{g.name}</span>
                  <span className="flex items-center gap-4 text-soft">
                    <span className="t-small tnum">{g.items.length} jobs</span>
                    <span className="plus text-ink" aria-hidden />
                  </span>
                </summary>
                <ul className="space-y-3.5 px-5 pb-5 pt-1">
                  {g.items.map((it) => (
                    <li key={it.name} className="grid grid-cols-[1fr_auto] gap-x-6">
                      <span className="t-body">{it.name}</span>
                      <span className="tnum text-right t-body">
                        {it.from ? <span className="text-soft">from </span> : null}
                        {formatMoney(it.price)}
                      </span>
                      <span className="t-small text-soft">
                        {it.time}
                        {it.note ? ` · ${it.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <figure className="tile tile-photo sticky top-20 aspect-[4/5] max-lg:mt-2 max-lg:aspect-video lg:h-[calc(100svh-96px)] lg:aspect-auto" data-reveal>
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/video/workshop-loop-poster.jpg"
              aria-label="Footage from a car workshop: a car on a lift, a mechanic at the wheel, an air conditioning machine, a wall of parts"
            >
              <source src="/video/workshop-loop.webm" type="video/webm" />
              <source src="/video/workshop-loop.mp4" type="video/mp4" />
            </video>
            <figcaption className="absolute bottom-0 left-0 flex h-7 items-center rounded-tr-tile bg-field px-3 text-[14px] text-field-ink">
              Footage of a base auto shop, public domain
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
